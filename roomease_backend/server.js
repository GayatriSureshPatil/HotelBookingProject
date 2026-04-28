const app = require("./index");
const cors = require('cors');
require('dotenv').config();

app.use(cors()); // Enable CORS


// Start Server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
