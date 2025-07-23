# Village Funding Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to connect project owners in villages with investors, facilitating funding for local development initiatives. The application features separate dashboards for project owners, investors, and administrators, with robust authentication and project management capabilities.

## ✨ Features

* **User Authentication:** Secure signup and login for Project Owners, Investors, and Admins.
* **Project Management (Owner):**
    * Add new projects with details (title, description, amount, location, deadline, priority, assigned engineer).
    * Upload supporting documents (PDF, DOCX, JPG/PNG).
    * View all submitted projects and their funding status.
    * Track admin approval status.
* **Investment Management (Investor):**
    * Browse approved projects available for funding.
    * Invest in projects.
    * View personal investment history.
    * Manage investor profile.
* **Admin Dashboard:**
    * Review and approve/reject projects.
    * Monitor all projects and investments.
* **Real-time Data:** Data persistence powered by MongoDB Atlas.
* **Containerization:** Full application deployed using Docker and Docker Compose.

## 🚀 Technologies Used

* **Frontend:** React.js, React Router DOM, Axios, CSS
* **Backend:** Node.js, Express.js, Mongoose, Multer (for file uploads), bcrypt (for password hashing), CORS
* **Database:** MongoDB Atlas (Cloud NoSQL Database)
* **Containerization:** Docker, Docker Compose
* **Development Tools:** ESLint

## 📦 Project Structure


.
├── client/                 # React Frontend Application
│   ├── public/             # Public assets (index.html, images, App.css)
│   │   ├── assets/
│   │   │   └── hero-image.png
│   │   ├── App.css         # Global styles moved here for Nginx serving
│   │   └── index.html
│   ├── src/                # React source code
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page-level React components (Login, Signup, Dashboards, AddProject)
│   │   └── App.js          # Main React app component
│   └── Dockerfile          # Dockerfile for building and serving the React app
│   └── nginx.conf          # Nginx configuration for React Router
├── server/                 # Node.js Express Backend API
│   ├── models/             # Mongoose schemas (User, Project, Investor, Investment)
│   ├── routes/             # Express API routes (users, projects, investors, investments, contact)
│   ├── uploads/            # Directory for uploaded project documents (ignored by Git)
│   ├── .env.example        # Example environment variables file
│   └── server.js           # Main Express server file
│   └── Dockerfile          # Dockerfile for building and running the Node.js backend
├── .env                    # Environment variables (local, NOT committed to Git)
├── .gitignore              # Specifies intentionally untracked files to ignore by Git
├── docker-compose.yml      # Defines multi-container Docker application
└── README.md               # Project documentation (this file)


## 🛠️ Local Development Setup

Follow these steps to get the application running on your local machine using Docker.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Git:** For cloning the repository.
* **Node.js & npm:** (Optional, but good for local development/testing outside Docker)
    * [Download Node.js](https://nodejs.org/en/download/) (includes npm).
* **Docker Desktop:** Essential for running the application in containers.
    * [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME
    ```
    (Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details).

2.  **Configure Environment Variables:**
    * Navigate into the `server` directory:
        ```bash
        cd server
        ```
    * Create a new file named `.env` in the `server` directory.
    * Copy the contents from `server/.env.example` into your new `server/.env` file.
    * **Crucially, update the `MONGO_URI`** with your actual MongoDB Atlas connection string. This should look like:
        ```
        MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority&appName=<app-name>"
        PORT=5000
        ```
        Make sure to replace `<username>`, `<password>`, `<cluster-url>`, `<database-name>`, and `<app-name>` with your MongoDB Atlas credentials.
    * Go back to the project root:
        ```bash
        cd ..
        ```

3.  **Build and Run with Docker Compose:**
    * Ensure Docker Desktop is running.
    * From the project root directory (`YOUR_REPO_NAME`), run the following command to build the Docker images and start the containers:
        ```bash
        docker compose up --build
        ```
        * The first time you run this, it will take some time as Docker downloads base images and installs Node.js dependencies. Subsequent builds will be faster due to Docker's build cache.

4.  **Access the Application:**
    * Once both `frontend` and `backend` services are up and running (you'll see `Up` status in your terminal), open your web browser.
    * Access the application at:
        ```
        http://localhost
        ```

### Important Notes for Running the App:

* **Frontend Port:** The frontend is served on `http://localhost` (port 80) by Nginx.
* **Backend API:** The backend API runs on `http://localhost:5000`. Your frontend is configured to communicate with the backend service internally within Docker at `http://backend:5000`.
* **User Accounts:**
    * **Project Owners:** Sign up at `http://localhost/user-signup` and log in at `http://localhost/login`.
    * **Investors:** Sign up at `http://localhost/investor-signup` and log in at `http://localhost/investor-login`.
    * **Admin:** Log in at `http://localhost/admin/login` with demo credentials: `username: admin`, `password: admin123`.

## 📸 Screenshots

To showcase your dashboards, you can take screenshots and embed them here.

**How to include screenshots:**

1.  **Take Screenshots:** Capture images of your key dashboards (Owner Dashboard, Investor Dashboard, Admin Dashboard, Add Project page, etc.).
2.  **Upload to GitHub (Recommended):**
    * Create an `images` folder in your project's root (or within `docs/` if you prefer).
    * Commit your screenshot files (e.g., `owner-dashboard.png`, `add-project.png`) to this folder.
    * Once pushed to GitHub, you can get the direct URL to the image (e.g., `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/blob/main/images/owner-dashboard.png?raw=true`). Use the `?raw=true` suffix to get the direct image content.
3.  **Embed in README:** Use Markdown image syntax:
    ```markdown
    ### Owner Dashboard
    ![Owner Dashboard Screenshot](images/owner-dashboard.png)
    ```
    If you use a direct URL from GitHub (with `?raw=true`), it will look like:
    ```markdown
    ### Owner Dashboard
    ![Owner Dashboard Screenshot](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/blob/main/images/owner-dashboard.png?raw=true)
    ```
    Alternatively, you can use image hosting services like Imgur, but GitHub direct linking is often preferred for project documentation.

## 🌐 Deployment (Live Link)

Generating a live, publicly accessible link for your project requires deploying it to a cloud hosting provider. This is a separate process from simply pushing your code to GitHub.

Common deployment strategies for MERN stack applications with Docker include:

* **Frontend (React):** Vercel, Netlify, Render (as a static site).
* **Backend (Node.js/Express):** Render, Heroku (though Heroku's free tier is limited), AWS EC2, Google Cloud Run, DigitalOcean Droplets.
* **Database (MongoDB Atlas):** Already cloud-hosted, so no additional deployment needed for the database itself.

For an interview, having a robust local setup with clear instructions (as provided above) is often sufficient. If they specifically ask for a live link, you would need to set up a deployment pipeline on a chosen platform. This involves configuring environment variables, build commands, and service exposure on the cloud provider.

## 🤝 Contributing

Feel free to fork the repository, create a new branch, and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details (you would create a `LICENSE` file if you choose to include one).

## 📞 Contact

For any questions or feedback, please contact [Your Name/Email/LinkedIn Profile Link].
