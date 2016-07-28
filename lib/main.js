'use strict'

const spawn = require('child_process').spawn
const path = require('path')
const Table = require('cli-table')

let config
let processed
let results
let workers
let jobs
let totalJobs
let jobsPerWorker

module.exports = main

/**
 * Program entry point
 **/
function main(cfg) {
  config = cfg

  prepare()

  console.log(`Running ${totalJobs} Job(s) across ${config.workers} Worker(s).`)

  if (config.verbose) {
    logConfig(config)
    logJobsTable(totalJobs, jobsPerWorker)
  }

  start()
}

/**
 * Prepares the program to run, setting up variables to track progress and results
 **/
function prepare() {
  processed = 0
  results = {}
  workers = []
  totalJobs = config.iterations * config.paths.length
  jobsPerWorker = Math.ceil(totalJobs / config.workers)

  let normalize = path => config.baseUrl.replace(/\/$/, '') + ('/' + path).replace(/^\/*/g, '/')
  let urls = config.paths.map(p => new Array(config.iterations).fill(normalize(p)))

  // randomizing paths does something... maybe
  jobs = shuffle(flatten(urls)).map(url => ({
    url     : url,
    error   : null,
    time    : null,
    queries : null
  }))
}

/**
 * Starts the workers, passing relevant config options then wires up the worker's
 * stdout to trigger the onWorkerData callback. Finally, initiates the loop
 * by sending the next job to the worker
 **/
function start() {
  for (let i = 0; i < config.workers; i++) {
    let worker = spawn(path.resolve(__dirname, '..', 'bin', 'worker'), [], {
      env: Object.assign({}, process.env, { TIMEOUT: config.timeout })
    })

    worker.on('error', err => console.log(`Failed to start child worker.`, err))

    worker.stdout.on('data', onWorkerData(worker))
    worker.stdin.write(JSON.stringify(jobs.shift()))
  }
}

/**
 * Called when receiving data from a worker's stdout - checks if there was
 * an error in the job and then dispatches to the correct next function.
 * Finally, sends the worker the next job to be done
 **/
function onWorkerData(worker) {
  return data => {
    let job

    try {
      job = JSON.parse(data.toString())

      if (job.error) {
        onWorkerDataError(job)
      } else {
        onWorkerDataSuccess(job)
      }
    } catch(e) {
      console.log('Internal error parsing JSON response from worker', e, data.toString())
      process.exit(1)
    }

    let next

    if (jobs.length && (next = jobs.shift())) {
      setTimeout(_ => worker.stdin.write(JSON.stringify(next)), config.delay)
    } else {
      worker.stdin.end()
    }
  }
}

/**
 * If the job was successful, save the results, increment "processed", and
 * then report the final results if there's no more work left to do
 **/
function onWorkerDataSuccess(job) {
  if (config.verbose) {
    let table = new Table()
    table.push([job.time, job.queries, job.url.replace(config.baseUrl, '')])
    console.log(table.toString())
  }

  (results[job.url] = results[job.url] || []).push(job)

  processed++

  if (processed === totalJobs) {
    console.log(`Processing completed for "${config.baseUrl}" successfully.`)
    console.log(format(results))
  }
}

/**
 * If the job has an error, report the error and then return it to the jobs
 * queue for later re-processing
 **/
function onWorkerDataError(job) {
  console.log('Error fetching "' + job.url, '"!')
  console.log(job.error)
  job.error = null
  jobs.push(job)
}

function format(results) {
  let heading = `${config.iterations} Iteration(s) across ${config.workers} ` +
                `Worker(s): ${totalJobs} Total Jobs`

  let table = new Table({
    head: [heading, 'Avg. Time', 'Time STD' ,'Avg. Queries']
  })

  for (let url in results) {
    let jobs = results[url]
    let times = jobs.map(j => parseFloat(j.time))
    let queries = jobs.map(j => parseInt(j.queries, 10))
    let timesAvg = avg(times)
    let queriesAvg = avg(queries)

    table.push([
      url.replace(config.baseUrl, ''),
      `${timesAvg.toFixed(4)}s`,
      dev(times, timesAvg).toFixed(3),
      queriesAvg
    ])
  }

  return table.toString()
}

function avg(arr) {
  return arr.reduce((acc, n) => acc + n, 0) / arr.length
}

function dev(arr, avgs) {
  return Math.sqrt(avg(arr.map(n => Math.pow(n - avgs, 2)))) * 100
}

function flatten(arr) {
  return Array.prototype.concat.apply([], arr)
}

// http://stackoverflow.com/a/6274398/4611471
function shuffle(array) {
  let counter = array.length
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter)
    counter--
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array
}

function logJobsTable(totalJobs, jobsPerWorker) {
  var jobsTable = new Table({
    head: ['Jobs', 'Jobs per Worker']
  })

  jobsTable.push([totalJobs, jobsPerWorker])

  console.log(jobsTable.toString())
}

function logConfig(config) {
  var configTable = new Table({
    head: ['key', 'value']
  })

  for (var key in config) {
    configTable.push([key, config[key]])
  }

  console.log(configTable.toString())
}
