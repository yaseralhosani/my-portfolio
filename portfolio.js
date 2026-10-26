/* Your portfolio content lives here. No build step is required. */
window.PORTFOLIO = {
  name: "Yaser",
  role: "Data Analyst",
  initials: "y.",
  introduction: "I turn complex data into clear insights, thoughtful dashboards, and better decisions.",
  about: "I enjoy connecting the dots between a good question and a useful answer. My approach brings together careful analysis, clear visuals, and a little curiosity.",
  email: "", // Add your real email to enable the email links.
  github: "https://github.com/yaseralhosani", // Your verified public GitHub profile.
  linkedin: "", // Your complete LinkedIn profile URL.
  availability: "Open to opportunities",
  skills: [
    { name: "SQL", category: "Query & explore", description: "Joins, CTEs, window functions", icon: "database" },
    { name: "Python", category: "Analyze & automate", description: "Pandas, NumPy, Matplotlib", icon: "code" },
    { name: "Power BI", category: "Visualize & explain", description: "DAX, data models, dashboards", icon: "bars" },
    { name: "Tableau", category: "Visualize & explain", description: "Visual analytics, storytelling", icon: "grid" },
    { name: "Excel", category: "Clean & organize", description: "Power Query, pivot tables", icon: "sheet" },
    { name: "Statistics", category: "Test & understand", description: "Exploration, trends, experiments", icon: "chart" }
  ],
  projects: [
    {
      id: "retail", number: "01", isSample: true, image: "", category: "Business intelligence", filters: ["bi", "sql"],
      title: "The bigger picture in retail.",
      description: "A sales dashboard that connects revenue, product performance, and regional trends.",
      tags: ["Power BI", "SQL", "Data modeling"], visual: "retail", label: "Sales performance",
      year: "Sample project", type: "Interactive dashboard", repository: "", liveUrl: "",
      question: "Which products and regions are driving sales, and where should a retail team look next?",
      summary: "A worked example of turning transaction data into a focused sales overview. The dashboard brings revenue, margin, and order trends into one view.",
      process: [
        { title: "Build a trustworthy foundation", text: "Check transaction IDs, handle returns consistently, and join orders with a product and region reference table." },
        { title: "Define the measures", text: "Calculate net revenue, order count, average order value, and gross margin. Use the same date logic across every view." },
        { title: "Make the next question easy", text: "Compare months and regions, then drill into categories to understand what sits behind a headline number." }
      ],
      finding: "The example shows why revenue and margin need to be read together: a high-volume category can contribute less profit than its sales rank suggests.",
      nextStep: "Validate category costs and compare like-for-like periods before making pricing or inventory decisions.",
      dataNote: "Illustrative case study using synthetic retail data. The dashboard figures demonstrate the design; they are not business results."
    },
    {
      id: "retention", number: "02", isSample: true, image: "", category: "Customer analytics", filters: ["python", "sql"],
      title: "Understanding who comes back.",
      description: "Cohort analysis that explores customer retention beyond a single headline metric.",
      tags: ["Python", "SQL", "Cohort analysis"], visual: "retention", label: "Customer retention",
      year: "Sample project", type: "Exploratory analysis", repository: "", liveUrl: "",
      question: "How does repeat purchasing change after a customer's first order?",
      summary: "A cohort-based approach to understanding repeat behavior. Customers are grouped by first purchase month, then followed over comparable time windows.",
      process: [
        { title: "Define a returning customer", text: "Use completed purchases and stable customer IDs. Exclude cancelled orders and document how refunds are treated." },
        { title: "Build comparable cohorts", text: "Group customers by their first purchase month and calculate the share purchasing again in each following month." },
        { title: "Look beyond the average", text: "Compare cohort size, acquisition channel, and observation length so newer cohorts are not judged against fully observed ones." }
      ],
      finding: "In the illustrative heatmap, the biggest change happens between the first and second month. That is a useful place to investigate onboarding and the second-purchase experience.",
      nextStep: "Check the pattern with real cohorts, then test a targeted follow-up. A cohort chart alone cannot establish what caused customers to return.",
      dataNote: "Illustrative case study using synthetic customer data. Cohort percentages are demonstration values, not observed customer outcomes."
    },
    {
      id: "mobility", number: "03", isSample: true, image: "", category: "Exploratory analysis", filters: ["python"],
      title: "A city, one ride at a time.",
      description: "Exploring when people ride and how demand shifts throughout the week.",
      tags: ["Python", "Pandas", "Data visualization"], visual: "mobility", label: "Urban mobility",
      year: "Sample project", type: "Data storytelling", repository: "", liveUrl: "",
      question: "When does bike demand peak, and how do weekday and weekend patterns differ?",
      summary: "A visual exploration of trip timing and demand. Hourly views help separate weekday commuting patterns from weekend activity.",
      process: [
        { title: "Prepare the trip records", text: "Parse timestamps, check trip durations, remove duplicate records, and keep local time and daylight-saving rules consistent." },
        { title: "Find the daily rhythm", text: "Aggregate trips by hour and day type. Normalize by observed days so weekends and weekdays can be compared fairly." },
        { title: "Put patterns in context", text: "Inspect station-level demand and missing periods. Consider seasonality and weather before interpreting a peak." }
      ],
      finding: "The example has two weekday peaks and a broader weekend afternoon peak. Different daily rhythms would call for different bike rebalancing schedules.",
      nextStep: "Use a complete, seasonally representative dataset and evaluate station availability before recommending operational changes.",
      dataNote: "Illustrative case study using synthetic ride counts. The chart is a design demonstration, not a finding about a particular city."
    }
  ]
};
