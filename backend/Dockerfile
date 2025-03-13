# Set up a Python environment
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the app files into the container
COPY . .

# Set the Flask environment variable
ENV FLASK_APP=wsgi.py

# Expose the port the app will run on
EXPOSE 5000

# Run the Flask app
CMD ["flask", "run", "--host=0.0.0.0"]
