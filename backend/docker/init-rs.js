// This script is executed during container initialization
// It attempts to initiate a replica set for the single-node container.
// The mongo image will execute this on first startup.

rs.initiate({
  _id: 'rs0',
  // use the service name so other containers can resolve the replica set member
  members: [ { _id: 0, host: 'mongo:27017' } ]
})
