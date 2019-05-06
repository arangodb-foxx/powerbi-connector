# PowerBI Web connector for ArangoDB

This is an example PowerBI connector for ArangoDB.

## Installation

The PowerBI connector can be installed as a Foxx service using the
[ArangoDB web interface](https://docs.arangodb.com/latest/Manual/Programs/WebInterface/Services.html)
or the [Foxx CLI](https://github.com/arangodb/foxx-cli):

```sh
$ npm install --global foxx-cli
$ foxx install -u root -P -H http://localhost:8529 -D _system /powerbi \
https://github.com/arangodb-foxx/powerbi-connector/archive/master.zip

# or without installing foxx-cli:

$ npx foxx-cli install -u root -P -H http://localhost:8529 -D _system /powerbi \
https://github.com/arangodb-foxx/powerbi-connector/archive/master.zip
```

## Configuration

Before you can use the ArangoDB connector in PowerBI you need to configure the
service using the web interface or the Foxx CLI.

To configure the service in the ArangoDB web interface, open the service details
and then navigate to the _Settings_ tab in the top bar.

- **collections**: list of names of collections that will be exposed to PowerBI,
  as a comma-separated list, e.g. `payments,timeouts` will expose the collections
  `payments` and `timeouts` in the database the service was installed.

- **username** and **password**: credentials that will be used by PowerBI to
  authenticate against this service.

  **Note**: These credentials will only be used by PowerBI and should **not**
  match the ArangoDB user credentials used to access ArangoDB itself.

## Adding the data source

To add the connector as a data source in PowerBI,

## License

This code is licensed under the
[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
