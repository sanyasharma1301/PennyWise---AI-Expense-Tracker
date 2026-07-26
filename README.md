# PennyWise — AI Expense Tracker

PennyWise is an AI-assisted expense tracker designed for college students.

Users can record expenses using natural language instead of manually filling out multiple fields. For example:

> ₹250 Zomato dinner with friends

The application extracts the expense details, automatically categorises the transaction, stores the data, and provides spending insights through a dashboard.

## Features

- Add expenses using natural language
- Automatically extract amount, merchant, note, and category
- AI-assisted expense categorisation
- Indian-context expense support, including UPI payments, auto/rickshaw travel, mess expenses, food delivery, recharge, and books
- Create, edit, and delete expenses
- Dashboard with spending summaries
- Category-wise spending analysis
- Weekly spending visualisation
- Biggest expense tracking
- AI-powered monthly spending insights
- Personalised saving recommendations
- INR currency support
- Local data persistence

## Example

### Input

> ₹250 Zomato dinner with friends

### Parsed Expense

- **Amount:** ₹250
- **Merchant:** Zomato
- **Category:** Food
- **Note:** dinner with friends

## AI Insights

PennyWise analyses expense data to generate:

- Top spending categories
- Potential money leaks
- Personalised saving suggestions
- Recommended habit changes

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- AI-powered natural-language expense parsing
- LocalStorage
- Data visualisation

## Development Approach

PennyWise was developed using an AI-assisted development workflow. The product concept, user flow, expense categories, Indian-context parsing requirements, data structure, validation behaviour, dashboard requirements, and AI insights workflow were defined and iterated during development.

AI-assisted tools were used to accelerate implementation and UI development.

## Live Demo

[Try PennyWise](https://pennywise-sanya.lovable.app)

## Author

Sanya Sharma
