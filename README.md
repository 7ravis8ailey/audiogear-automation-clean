# AudioGear Selling Automation

eBay automation system for professional audio equipment with Notion integration and Netlify webhook support.

## Features

- Automated product research and database population
- Professional eBay listing generation
- Notion database integration
- Google Drive photo management
- eBay API integration with webhook support

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Deploy to Netlify for webhook support
3. Complete eBay OAuth flow

## Netlify Webhook

The `netlify/functions/ebay-notifications.js` file handles eBay marketplace account deletion notifications as required by eBay's developer program.

Once deployed to Netlify, use this endpoint in your eBay developer settings:
```
https://your-netlify-site.netlify.app/.netlify/functions/ebay-notifications
```

## Usage

```bash
# Process single product
python3 enhanced_automation.py single "Product Name" "Brand" "Model"

# Bulk processing
python3 enhanced_automation.py bulk --csv products.csv
```
