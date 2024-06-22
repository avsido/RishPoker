# use small nginx image as parent image:
FROM nginx:alpine

# copy client folder contents to the default nginx public folder:
COPY client/ /usr/share/nginx/html

# expose port 80:
EXPOSE 80

# no need for CMD; nginx image will start nginx automatically
