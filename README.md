
## Getting Started
First adding .env.local file

The required environment variables are in the submission dialog area

First, run the development server:

```bash
npm install

then..
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More -- Deploying to Azure
Here are the steps that we took
- set up Database in azure
- set up Blob Storage in azure
- make sure both run in next.js
- make the project in github
- connect the web app in azure through github

## Local Development
Copy `.env.example` to `.env.local` and fill in the values.
If you see an Azure SQL firewall error, ask the team lead to whitelist your IP.

## Issues that we encountered
- The biggest challenge that we faced was when deploying on azure through github
- Because we are using tailwind, there are some configuration issues
- At first, when we deployed the style didn't show up
- Then we had to make some changes in the setting to make the style work
