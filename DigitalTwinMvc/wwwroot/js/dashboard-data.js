
const SK = [
// skills: current level and the level needed for the career target
  { n: "Python", now: 78, goal: 90 },
  { n: "Machine Learning", now: 52, goal: 85 },
  { n: "SQL", now: 74, goal: 80 },
  { n: "React", now: 82, goal: 80 },
  { n: "Cloud", now: 38, goal: 70 },
  { n: "Security", now: 44, goal: 65 }
];

const CO = [
  { c: "Data Structures", now: 88, pred: 85 },
  { c: "Databases", now: 74, pred: 72 },
  { c: "Machine Learning", now: 69, pred: 63 },
  { c: "Web Development", now: 91, pred: 92 },
  { c: "Algorithms", now: 61, pred: 56 },
  { c: "Computer Networks", now: 78, pred: 79 }
];

const RE = [
  { t: "Machine Learning Crash Course", k: "Course", why: "Closes your largest skill gap (33 points)." },
  { t: "AWS Cloud Practitioner Path", k: "Certificate", why: "Cloud is required for the Data Engineer path." },
  { t: "Dynamic Programming explained", k: "Short video", why: "Your predicted Algorithms grade is dropping." },
  { t: "Intro to Web Application Security", k: "Course", why: "Security is 21 points below your target." }
];

const RES = {
  "Machine Learning": ["Machine Learning Crash Course (course, 15 h)", "Hands-on scikit-learn labs (practice, 8 h)"],
  "Cloud": ["AWS Cloud Practitioner Path (certificate, 20 h)", "Cloud basics in 30 minutes (short video)"],
  "Security": ["Intro to Web Application Security (course, 10 h)"],
  "Python": ["Advanced Python patterns (course, 6 h)"],
  "SQL": ["Window functions workshop (practice, 4 h)"]
};

const LESSONS = {
  "Data Structures": [
    { t: "Arrays vs linked lists", x: "Arrays give fast access by index. Linked lists give fast inserts and deletes. Choose by what your program does most.", m: 10 },
    { t: "Stacks and queues", x: "A stack is last in, first out. A queue is first in, first out. Both are built on arrays or linked lists.", m: 12 },
    { t: "Trees and binary search trees", x: "A binary search tree keeps smaller values on the left and bigger ones on the right, so search is fast when it stays balanced.", m: 15 },
    { t: "Hash tables", x: "A hash function turns a key into an index. Lookups are fast on average, but collisions must be handled.", m: 12 }
  ],
  "Databases": [
    { t: "Keys and ER diagrams", x: "A primary key identifies a row. A foreign key points to a row in another table. ER diagrams show these links.", m: 10 },
    { t: "SQL joins", x: "INNER JOIN keeps rows that match in both tables. LEFT JOIN also keeps unmatched rows from the left table.", m: 15 },
    { t: "Normalization", x: "Normalization splits data into tables so each fact is stored once. This avoids update mistakes.", m: 12 },
    { t: "Indexes and transactions", x: "An index speeds up searches. A transaction groups steps so they all succeed or all fail.", m: 12 }
  ],
  "Machine Learning": [
    { t: "What is a model", x: "A model learns a rule from examples. Training data teaches it, and new data tests it.", m: 10 },
    { t: "Linear regression", x: "Linear regression fits a straight line to predict a number, such as a grade from study hours.", m: 15 },
    { t: "Overfitting", x: "A model that memorizes the training data fails on new data. Simpler models and more data help.", m: 12 },
    { t: "Evaluating a model", x: "Always keep test data aside. Accuracy, precision and recall tell you different things about the errors.", m: 15 }
  ],
  "Web Development": [
    { t: "HTML and CSS layout", x: "HTML gives the structure and CSS gives the look. Flexbox and grid place elements on the page.", m: 10 },
    { t: "JavaScript events", x: "Events like click and submit let the page react to the user. Use addEventListener to handle them.", m: 12 },
    { t: "Fetching data", x: "fetch asks a server for data and returns a promise. Use async and await to keep the code readable.", m: 12 },
    { t: "Forms and validation", x: "Check user input on the page and again on the server. Never trust data that comes from the browser.", m: 10 }
  ],
  "Algorithms": [
    { t: "Big-O basics", x: "Big-O describes how running time grows with input size. O(n) grows in a line and O(n squared) grows much faster.", m: 12 },
    { t: "Sorting algorithms", x: "Bubble sort is simple but slow. Merge sort and quick sort run in about n log n time.", m: 15 },
    { t: "Recursion", x: "A recursive function calls itself on a smaller input. It needs a base case to stop.", m: 12 },
    { t: "Dynamic programming", x: "Split the problem into overlapping parts and save each answer in a table so it is computed only once.", m: 20 }
  ],
  "Computer Networks": [
    { t: "TCP/IP layers", x: "Data passes through layers: application, transport, internet and link. Each layer has its own job.", m: 10 },
    { t: "IP addresses and subnets", x: "An IP address names a device. A subnet mask tells which part is the network and which part is the host.", m: 15 },
    { t: "TCP vs UDP", x: "TCP is reliable and ordered. UDP is faster but has no guarantee, so it suits video calls and games.", m: 10 },
    { t: "DNS and HTTP", x: "DNS turns a name into an IP address. HTTP is the request and response protocol of the web.", m: 12 }
  ]
};

const ST = [
  { id: "420230300", name: "Muhannad Ayman", gpa: 3.6, att: 96, pred: 3.6, risk: 12, hist: [3.2, 3.3, 3.4, 3.45, 3.5, 3.6], why: ["Stable grades", "Attendance above 95%"] },
  { id: "420241009", name: "Omar Hassanien", gpa: 3.21, att: 91, pred: 3.12, risk: 34, hist: [2.9, 3.0, 3.05, 3.1, 3.15, 3.21], why: ["Algorithms grade falling", "Machine Learning below 70"] },
  { id: "420231068", name: "Salah-Eldien Mohammad", gpa: 2.4, att: 72, pred: 2.1, risk: 78, hist: [3.2, 3.1, 2.9, 2.7, 2.5, 2.4], why: ["Attendance fell 18% this term", "Two failed quizzes in Databases", "No activity logged for 3 weeks"] },
  { id: "420230163", name: "Saeed Qassim", gpa: 2.9, att: 83, pred: 2.8, risk: 49, hist: [3.2, 3.15, 3.1, 3.0, 2.95, 2.9], why: ["Networks grade dropped 9 points", "Late submissions in 3 courses"] },
  { id: "420220412", name: "Mostafa Ghallab", gpa: 2.2, att: 68, pred: 1.9, risk: 86, hist: [3.1, 2.9, 2.7, 2.5, 2.3, 2.2], why: ["Attendance below 70%", "Predicted GPA under 2.0", "Missing two assignments"] },
  { id: "420230088", name: "Ibrahim Hassan", gpa: 3.3, att: 90, pred: 3.3, risk: 18, hist: [3.1, 3.15, 3.2, 3.25, 3.3, 3.3], why: ["Consistent performance"] },
  { id: "420230909", name: "Hassan Hany", gpa: 2.7, att: 80, pred: 2.6, risk: 57, hist: [3.2, 3.1, 3.0, 2.9, 2.8, 2.7], why: ["Weak result in Algorithms midterm", "Attendance trending down"] }
];
const ME = ST[1]; // the logged in student

const KB = [
  [/dynamic|\bdp\b/, "Dynamic programming solves a problem by splitting it into overlapping subproblems and storing each answer so it is computed once. Start with a recursive solution, then add a table or memo.", "Dynamic Programming explained (short video)"],
  [/machine|ml|learning/, "Machine learning finds patterns in data to make predictions. Start with linear regression, then decision trees, and always test on data the model has not seen.", "Machine Learning Crash Course"],
  [/sql|database|join/, "SQL queries describe what data you want. JOIN combines tables on matching keys, GROUP BY summarizes rows, and an index speeds up lookups.", "Window functions workshop"],
  [/cloud|aws/, "Cloud computing rents servers, storage and databases over the internet. Learn compute, storage, networking and IAM first.", "AWS Cloud Practitioner Path"],
  [/secur|xss|injection/, "Web security starts with validating input, escaping output, using HTTPS and storing passwords hashed. Learn the OWASP Top 10.", "Intro to Web Application Security"],
  [/network|tcp|ip/, "Networks move data in layers. TCP gives reliable delivery, IP handles addressing and routing, and DNS turns names into addresses.", "Computer Networks revision video"]
];

const NOTES = {
  student: [
    { t: "Your Algorithms forecast dropped 5 points.", d: "Today", r: 0, m: "Your predicted Algorithms grade is now 56, down 5 points from last week. Open the course and finish the lessons to bring it back up.", l: "#/course/Algorithms", lt: "Open Algorithms course" },
    { t: "Dr. Hayam sent you guidance.", d: "Yesterday", r: 0, m: "Please book a tutoring session for Algorithms before the midterm review.", l: "#/guidance", lt: "Open Advisor Guidance" }
  ],
  advisor: [
    { t: "Mostafa Ghallab moved to high risk.", d: "Today", r: 0, m: "Mostafa Ghallab's risk is now 86%. His attendance is below 70% and two assignments are missing. Consider saving an intervention plan.", l: "#/student/420220412/plans", lt: "Open his plans" },
    { t: "2 certificates are waiting for verification.", d: "Today", r: 0, m: "Two students uploaded certificates. Check them before they count toward the student's skills.", l: "#/credentials", lt: "Verify credentials" },
    { t: "Salah-Eldien Mohammad has no activity for 3 weeks.", d: "Yesterday", r: 0, m: "No logins or submissions from Salah-Eldien Mohammad for three weeks. His risk level is High.", l: "#/student/420231068/predictions", lt: "Open student" }
  ]
};

const MENU = {
  student: [["dashboard", "Dashboard"], ["profile", "Academic Profile"], ["progress", "Learning Progress"], ["predicted", "Predicted Performance"], ["skills", "Skill Gap Analysis"], ["recs", "Recommendations"], ["resources", "Learning Resources"], ["guidance", "Advisor Guidance"], ["upload", "Upload Certificate"], ["askai", "Ask AI"], ["notifications", "Notifications"], ["settings", "Profile Settings"]],
  advisor: [["dashboard", "Dashboard"], ["search", "Search Student"], ["atrisk", "At-Risk Students"], ["students", "My Students"], ["plans", "Intervention Plans"], ["guidance", "Send Guidance"], ["users", "Manage Users"], ["grades", "Enter Grades"], ["credentials", "Verify Credentials"], ["notifications", "Notifications"]]
};
const HIDDEN = { student: ["course"], advisor: ["student"] };

const PROF = {
  student: { name: ME.name, email: "omar.hassanien@fa-hists.edu.eg" },
  advisor: { name: "Dr. Hayam Abdelmordy", email: "hayam@fa-hists.edu.eg" }
};


const COURSE_URL = "";
const COURSE_LINKS = {
  // "Algorithms": "https://example.com/courses/algorithms",
};
