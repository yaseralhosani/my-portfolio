/* Portfolio content. Edit through /admin/ or update this JSON object. */
window.PORTFOLIO = {
  "name": "Yaser",
  "role": "Web & Microsoft Solutions",
  "initials": "y.",
  "introduction": "I create web applications, websites, dashboards, and automations that make everyday work easier.",
  "about": "My strengths span Microsoft 365 and Office, Power BI, Power Apps, and Power Automate. I also work with WordPress, WooCommerce, and web design to make digital tools clear, practical, and easy to use.",
  "email": "y4ser.alhosani@gmail.com",
  "contactFormEndpoint": "",
  "github": "https://github.com/yaseralhosani",
  "linkedin": "",
  "availability": "Open to opportunities",
  "skills": [
    {
      "name": "Web Applications",
      "category": "Build & connect",
      "description": "Interactive tools and business apps",
      "icon": "code"
    },
    {
      "name": "Microsoft 365 & Office",
      "category": "Everyday productivity",
      "description": "Office apps and connected work",
      "icon": "office"
    },
    {
      "name": "Power BI",
      "category": "Reporting & insights",
      "description": "Dashboards and clear data visuals",
      "icon": "bars"
    },
    {
      "name": "Power Apps",
      "category": "Business applications",
      "description": "Apps for everyday business needs",
      "icon": "app"
    },
    {
      "name": "Power Automate",
      "category": "Workflow automation",
      "description": "Workflows and connected tasks",
      "icon": "flow"
    },
    {
      "name": "WordPress",
      "category": "Websites & content",
      "description": "Websites and content management",
      "icon": "web"
    },
    {
      "name": "WooCommerce",
      "category": "Online commerce",
      "description": "Online stores and product experiences",
      "icon": "store"
    },
    {
      "name": "Web Design",
      "category": "Design & experience",
      "description": "Clear layouts and usable interfaces",
      "icon": "design"
    }
  ],
  "projects": [
    {
      "id": "retail",
      "number": "01",
      "isSample": true,
      "image": "",
      "category": "Business intelligence",
      "filters": [
        "bi",
        "sql"
      ],
      "title": "The bigger picture in retail.",
      "description": "A sales dashboard that connects revenue, product performance, and regional trends.",
      "tags": [
        "Power BI",
        "SQL",
        "Data modeling"
      ],
      "visual": "retail",
      "label": "Sales performance",
      "year": "Sample project",
      "type": "Interactive dashboard",
      "repository": "",
      "liveUrl": "",
      "question": "Which products and regions are driving sales, and where should a retail team look next?",
      "summary": "A worked example of turning transaction data into a focused sales overview. The dashboard brings revenue, margin, and order trends into one view.",
      "process": [
        {
          "title": "Build a trustworthy foundation",
          "text": "Check transaction IDs, handle returns consistently, and join orders with a product and region reference table."
        },
        {
          "title": "Define the measures",
          "text": "Calculate net revenue, order count, average order value, and gross margin. Use the same date logic across every view."
        },
        {
          "title": "Make the next question easy",
          "text": "Compare months and regions, then drill into categories to understand what sits behind a headline number."
        }
      ],
      "finding": "The example shows why revenue and margin need to be read together: a high-volume category can contribute less profit than its sales rank suggests.",
      "nextStep": "Validate category costs and compare like-for-like periods before making pricing or inventory decisions.",
      "dataNote": "Illustrative case study using synthetic retail data. The dashboard figures demonstrate the design; they are not business results."
    },
    {
      "id": "retention",
      "number": "02",
      "isSample": true,
      "image": "",
      "category": "Customer analytics",
      "filters": [
        "python",
        "sql"
      ],
      "title": "Understanding who comes back.",
      "description": "Cohort analysis that explores customer retention beyond a single headline metric.",
      "tags": [
        "Python",
        "SQL",
        "Cohort analysis"
      ],
      "visual": "retention",
      "label": "Customer retention",
      "year": "Sample project",
      "type": "Exploratory analysis",
      "repository": "",
      "liveUrl": "",
      "question": "How does repeat purchasing change after a customer's first order?",
      "summary": "A cohort-based approach to understanding repeat behavior. Customers are grouped by first purchase month, then followed over comparable time windows.",
      "process": [
        {
          "title": "Define a returning customer",
          "text": "Use completed purchases and stable customer IDs. Exclude cancelled orders and document how refunds are treated."
        },
        {
          "title": "Build comparable cohorts",
          "text": "Group customers by their first purchase month and calculate the share purchasing again in each following month."
        },
        {
          "title": "Look beyond the average",
          "text": "Compare cohort size, acquisition channel, and observation length so newer cohorts are not judged against fully observed ones."
        }
      ],
      "finding": "In the illustrative heatmap, the biggest change happens between the first and second month. That is a useful place to investigate onboarding and the second-purchase experience.",
      "nextStep": "Check the pattern with real cohorts, then test a targeted follow-up. A cohort chart alone cannot establish what caused customers to return.",
      "dataNote": "Illustrative case study using synthetic customer data. Cohort percentages are demonstration values, not observed customer outcomes."
    },
    {
      "id": "mobility",
      "number": "03",
      "isSample": true,
      "image": "",
      "category": "Exploratory analysis",
      "filters": [
        "python"
      ],
      "title": "A city, one ride at a time.",
      "description": "Exploring when people ride and how demand shifts throughout the week.",
      "tags": [
        "Python",
        "Pandas",
        "Data visualization"
      ],
      "visual": "mobility",
      "label": "Urban mobility",
      "year": "Sample project",
      "type": "Data storytelling",
      "repository": "",
      "liveUrl": "",
      "question": "When does bike demand peak, and how do weekday and weekend patterns differ?",
      "summary": "A visual exploration of trip timing and demand. Hourly views help separate weekday commuting patterns from weekend activity.",
      "process": [
        {
          "title": "Prepare the trip records",
          "text": "Parse timestamps, check trip durations, remove duplicate records, and keep local time and daylight-saving rules consistent."
        },
        {
          "title": "Find the daily rhythm",
          "text": "Aggregate trips by hour and day type. Normalize by observed days so weekends and weekdays can be compared fairly."
        },
        {
          "title": "Put patterns in context",
          "text": "Inspect station-level demand and missing periods. Consider seasonality and weather before interpreting a peak."
        }
      ],
      "finding": "The example has two weekday peaks and a broader weekend afternoon peak. Different daily rhythms would call for different bike rebalancing schedules.",
      "nextStep": "Use a complete, seasonally representative dataset and evaluate station availability before recommending operational changes.",
      "dataNote": "Illustrative case study using synthetic ride counts. The chart is a design demonstration, not a finding about a particular city."
    }
  ]
};
