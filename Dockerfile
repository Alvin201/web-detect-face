# Use an official Nginx image
FROM nginx:alpine

# Set the working directory in the container
WORKDIR /usr/share/nginx/html

# Copy your TensorFlow.js models to the /models directory
COPY models/weights /usr/share/nginx/html/models

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf


# Expose port 80 for HTTP access
EXPOSE 8067

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
