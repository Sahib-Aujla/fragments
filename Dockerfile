
# Stage 0 dowloading dependencies 
FROM node:20.12.2@sha256:3864be2201676a715cf240cfc17aec1d62459f92a7cbe7d32d1675e226e736c9 AS dependencies

LABEL maintainer="Sahibpreet Singh sahibpreet-singh1@myseneca.ca" 
LABEL description="Fragments node.js microservice"


# setting node env to production
ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Working directory in docker container
WORKDIR /app


# Using this instead of copying the whole directory (COPY . /app) due to docker caching and layering
COPY package.json package-lock.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install 



############################

# stage 1: Copying remaining required files and 
# copy src to /app/src
FROM node:20-alpine@sha256:66c7d989b6dabba6b4305b88f40912679aebd9f387a5b16ffa76dfb9ae90b060 AS builder

WORKDIR /app

# Copy cached dependencies from previous stage so we don't have to download
COPY --from=dependencies /app /app

COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd


##################################
#Stage 3: Deploy
FROM node:20-alpine@sha256:66c7d989b6dabba6b4305b88f40912679aebd9f387a5b16ffa76dfb9ae90b060 AS deploy

WORKDIR /app
# Put our build/ into /usr/share/nginx/html/ and host static files
COPY --from=builder /app /app
CMD ["npm","start"]


# This does not do anything only for documentation puroposes
# A port mapping is required when running the container
EXPOSE 8080

HEALTHCHECK --interval=100s --timeout=100s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1






