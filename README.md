<center><img  src="https://map.mymizu.co/public/images/logo.svg" width="400" alt="mymizu logo" align="center" /></center>

# 1. **What is this project**

**mymizu Open-Source Web App**

For the past 3 years, mymizu has been harnessing the power of technology and community to tackle single-use plastic waste and encourage people to think and act on the environment in their everyday lives. Now we would like to open up the building of the mymizu platform to the global tech community to see what magic that brings.

We are launching an open-source web app for mymizu that is enabling anyone to search our global, 200,000-strong refill spot network from their browser, but also - we hope - to develop and test out new ideas and features (e.g. filtering refill spots, live community stats, etc).

And we need YOUR HELP to build it.

Each line of code you write has the potential to drastically reduce plastic in Japan.
For more information see details below!

# 2. How to get started

# mymizu Web

pre-requisites:
- [NodeJS](https://nodejs.org/en/download/package-manager/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- mymizu api key
- mymizu user token

### How to get a mymizu API key
You will need to get someone from the mymizu team to generate an API key for you.

### How to generate a user token
Simply run:
```bash
curl -l 'https://api.mymizu.co/api/start?api_key=$INSERT_API_KEY&platform=ios&client_version=1.0.0&client_build=12345&uuid=UNIQUEUSERID'

# Your response should look like this:
{"new_token":$YOUR_USER_TOKEN} # Use the `new_token` value for user token.
```

## Development

**Running the project locally**

All commands should be run in the project root directory.
```bash
# Create an .env file & insert the appropriate values. Be sure to include your api key and user token from the previous steps.
cp .env.sample .env

# Install dependencies
yarn 
#FOR DEVELOPMENT
# Run server with watch. This command will restart the server when a change has been detected
yarn start:reload
#development proxy is hard coded to http://localhost:3000/ please edit this in pakage.json if your server is runnign on a different port

#Run in a new terminal run the front end this will update the Vitual DOM so changes to front end are seen in real time
yarn react-scripts start
#this will automatically proxy to the server. please run the server frist.

#FOR DEPLOYMENT TESTING
# Compile both backend & client code
# Make sure to re-run this if you want to see your changes built
yarn build

# Compile for prod. This minifies the compiled files for production
yarn build:prod

# Run server with watch. This command will restart the server when a change has been detected
yarn start:reload

# Run server without watch
yarn start
```

**Routing / Adding Pages**

You can add routes to `server/server.jsx`, and be sure to import the component in which you'd like to inject into the html page, like so:

```javascript
import { YourCustomComponent } from "path/to/your/component"
//...
app.get("/a-new-page", (req, res) => {
  fs.readFile(path.resolve("./public/path/to/your/html/file.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    return res.send(
      data.replace(
        '<div id="root"></div>',
        `<div id="root">${ReactDOMServer.renderToString(<YourCustomComponent />)}</div>`
      )
    );
  });
});
```

# 3. Pick a feature to work on

Please see CONTRIBUTING file for information about how to contribute, and report bugs or suggest new features.

# 4. Join our slack community

Please feel free to join our [Slack community](https://docs.google.com/forms/d/1Y87ByAJrkfp2Hk3idfg4bx1t3iDfrO5bEu9zmKv9ewg/prefill)
You can introduce yourself and share any questions. If you have any ideas for features and / or issues you can also reach out to us here!
Or reach out to us directly if you have any questions [opensource@mymizu.co](mailto:opensource@mymizu.co)

# 5. Contributors

## Hackathon Contributors

Thank you to all participants in our Summer 2022 Hackathon for their contributions

- [Alexandre Plagnard](https://github.com/alexminden)
- [Andy Park](https://github.com/atparkweb)
- [Dominic Lowes](https://github.com/SodaJyu)
- [Quentin Siutkowski](https://www.linkedin.com/in/qsiutkowski/en)
- [Juli Boucree](https://github.com/juliwithoutthee)

and many others!
