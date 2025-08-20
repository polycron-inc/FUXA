FROM node:18-bookworm
ARG NODE_SNAP=false

RUN apt-get update && apt-get install -y dos2unix

# Change working directory
WORKDIR /usr/src/app

# Clone FUXA repository
ADD . /usr/src/app/FUXA

# Install build dependencies for node-odbc
RUN apt-get update && apt-get install -y build-essential unixodbc unixodbc-dev

# Convert the script to Unix format and make it executable
RUN dos2unix FUXA/odbc/install_odbc_drivers.sh && chmod +x FUXA/odbc/install_odbc_drivers.sh

WORKDIR /usr/src/app/FUXA/odbc
RUN ./install_odbc_drivers.sh

# Change working directory
WORKDIR /usr/src/app

# Copy odbcinst.ini to /etc
RUN cp FUXA/odbc/odbcinst.ini /etc/odbcinst.ini

# === 添加前端構建步驟 ===
# Install and build client (前端)
WORKDIR /usr/src/app/FUXA/client
RUN npm install
RUN npm run build -- --configuration=production

# Install Fuxa server
WORKDIR /usr/src/app/FUXA/server
RUN npm install

# Install options snap7
RUN if [ "$NODE_SNAP" = "true" ]; then \
    npm install node-snap7; \
    fi

# Workaround for sqlite3
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && \
    apt-get autoremove -yqq --purge && \
    apt-get clean  && \
    rm -rf /var/lib/apt/lists/*  && \
    npm install --build-from-source --sqlite=/usr/bin sqlite3

# Set working directory
WORKDIR /usr/src/app/FUXA/server

# Expose port
EXPOSE 1881

# 設置生產環境變量
ENV NODE_ENV=production

# Start the server
CMD [ "npm", "start" ]