# Twitter RSS Shim

A Hapi.js based shim for converting Twitter Application API calls to RSS feeds.

## Environment Variables

- `TWITTER_API_KEY` - Twitter Application API Key
- `TWITTER_API_SECRET` - Twitter Application API Secret
- `PORT` - (Optional) Port to bind to

## Usage

`node ./dist/twitter-rss-api.js`

## Development

1. Install dependencies (`npm i` or `yarn install`)
1. Create a `.env` file containing env keys
  ``` yaml
  TWITTER_API_SECRET=secret
  TWITTER_API_KEY=key
  ```
1. `npm run dev`
