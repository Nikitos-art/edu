### Things to check before deployment ###

All the dynamic paths in code

### Deployment Procedure ###

### Step 1 Prior to Deployment ###

1) Back up POSTGRESQL data
2) Copy and import the db back up file
3) Delete the old droplet
4) Create a new droplet 
5) Set up and configure Fail2Ban, UFW, and iptables, safeguard SSH access
6) Remove clud init files, update and upgrade
7) Change DNS records
8) Wait for DNS process to finish

### Step 2 During the Deployment ###

1) Create users, groups and roles, adjust privilages
2) Create project directory and backup directory
3) Create .env and .gitignore 
4) Clone or init the repository
5) Run Docker
6) Copy and recover the backed up POSTGRESQL data

### Step 3 After the Deployment ###

1) Monitor traffic

### PSQL ###

psql -U postgres my_database
OR 
sudo -u postgres psql

######

edudb=# CREATE USER <username> WITH PASSWORD <password>;

GRANT ALL ON SCHEMA public TO <username>;
GRANT ALL PRIVILEGES ON DATABASE <db_name> TO <username>;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO <username>;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO <username>;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO <username>;

# Docker #
docker exec -it django_dev bash
docker exec -it postgres_dev bash

docker logs 

docker ps
docker logs <container_name>
docker network ls
docker network inspect <network_id>
######
# Copied local PostgreSQL to Container Postgres #
pg_dump -U nikita -h localhost -d edudb > edu_backup.sql
### nikita might not have permissions so this will do the trick
pg_dump -U nikita -h localhost -d edudb --no-owner --verbose > edu_backup.sql
pg_dump -U nikita -h localhost -d edudb --no-owner --data-only --verbose > edu_backup.sql


docker cp edu_backup.sql postgres_dev:/edu_backup.sql
psql -U postgres -d edudb -f /edu_backup.sql
######
# EXTRA
Restarting services...
Service restarts being deferred:
 /etc/needrestart/restart.d/dbus.service
 systemctl restart getty@tty1.service
 systemctl restart networkd-dispatcher.service
 systemctl restart systemd-logind.service
 systemctl restart unattended-upgrades.service
 systemctl restart user@0.service

# FAIL2BAN #
sudo fail2ban-client status
sudo fail2ban-client status <jailname>
# IPtabes #
iptables -L -n -v
# Pretty Logs on Server
./parse_nginx_logs.py /var/log/nginx/access.log ./logs.txt
# Daphne onserver 
sudo journalctl -u daphne -n 50
journalctl -u gunicorn -n 20
# Adding SSH identity for remote access

cd ~/.ssh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_ocean
ssh -p 31415 nikitonik@104.248.12.151

# Check SSH login history
sudo journalctl -u ssh --no-pager | grep "Accepted"
# Safe copy remote file to local location
scp -P 31415 nikitonik@104.248.12.151:/remote/path/filename /local/path
# View remote directory content
ssh -P 31415 user@your_droplet_ip "ls /path/to/directory"
scp -P 31415 nikitonik@104.248.12.151:/etc/nginx/sites-available/tutors_django /home/nikitos/Projects/edu
# django_edu
_____________________________________________________
daphne -b 127.0.0.1 -p 8001 tutors_django.asgi:application

Fake users locally:
_________________________________________________________________________
1. michelle19@gmail.com - tutor 
2. braianmichels@yahoo.com - tutor 
3. ellakrit@gmail.com - student 
4. loganyu@gmail.com - student
5. tutorsuser@gmail.com - tutor
6. nikitakurpas123@gmail.com - tutor
pwd = HeLo^7$gyello
---------------------------------------------------------------------------------
SSH CONNECTION 
ssh username@your_server_ip

----------------------------------------------------------------------------------
# Cubelet CI/CD
1. git pull origin main
----------------------------------------------------------------------------------
systemctl daemon-reload
----------------------------------------------------------------------------------
/etc/systemd/system/gunicorn.service
----------------------------------------------------------------------------------
The reload command works only if the service file defines how to reload the service. 
If it's not defined, you can either add an ExecReload directive to the service file or simply use the restart command instead.
----------------------------------------------------------------------------------------------
*******************************To gracefully reload gunicorn**********************************
ps aux | grep gunicorn
kill -HUP <pid>
There maybe several gunicorn processes running for 2 users: root and django or www-data.
--------------------------------------------------------------------------------------------

# Nginx 
---------------------------------------------------------------------------------
Steps to changing SSL from Namecheap to Let's Encrypt
1. sudo apt-get update && sudo apt-get upgrade -y
2. Install Certbot.

Certbot is the client that communicates with Let's Encrypt to obtain SSL certificates.
Install Certbot and the necessary plugin for Nginx.
# sudo apt-get install certbot python3-certbot-nginx -y
3. Obtain the SSL Certificate
sudo certbot --nginx -d lighthouse-tutors.com -d www.lighthouse-tutors.com

Error occurred:
Saving debug log to /var/log/letsencrypt/letsencrypt.log
---------------------------------------------------------------------------------
VIM commands to comment and uncomment the whole page
gg
Ctrl + V
G
I
#
Esc
:wq
-------------------
gg
Ctrl + V
G
0
l
x
:wq
------------------Local Droplet changes different from repo problem----------------

========================= CHESS game descriptions =========================
THERE ARE 4 MODULES:
1. chessboard.js
2. game_logic.js
3. ai_moves.js
4. moves_logic.js

###################### POETRY #########################
poetry add $(cat requirements.txt)
Get-Content requirements.txt | ForEach-Object { poetry add $_ }


###################### Prod .env #########################
DJANGO_SECRET_KEY_2="django-insecure-*bma$fvx&7&9t#xw3n0p@_(s=ekr_8q8jh0uak0na7#potye=8"
DJANGO_SECRET_KEY="eMgs_KoYlSp07YW9NlkCzJp0tv9thFeDVFmvDlq6rtShsKdlkZVTFn7boniBZ_882Lk"
PSQL_DB_NAME="edudb"
PSQL_USER="nikita"
PSQL_PSWD="neK67Kuv0"
EMAIL="lighthouse.tutors.inquiry@gmail.com"
EMAIL_APP_PASSWORD="ifbf anal lzkd xykb"
DJANGO_ALLOWED_HOSTS="lighthouse-tutors.com,www.lighthouse-tutors.com,localhost"
DEBUG="False"
CORS_ALLOWED_ORIGINS=https://www.lighthouse-tutors.com
DJANGO_SETTINGS_MODULE="config.settings.settings_prod"

###################### Prod gunicorn.service #########################
root@django-lighthouse-tutors:/home/django/django_edu# cat /etc/systemd/system/gunicorn.service
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=django
Group=www-data
WorkingDirectory=/home/django/django_edu/tutors_django
Environment="PYTHONPATH=/home/django/django_edu/tutors_django"
Environment="PATH=/home/django/.local/share/pypoetry/venv/bin:$PATH"
ExecStart=/home/django/.cache/pypoetry/virtualenvs/django-edu-NVeF266P-py3.10/bin/gunicorn --access-logfile /var/log/gunicorn/access.log --error-logfile /var/log/gunicorn/error.log --workers 3 --bind unix:/run/gunicorn.sock config.wsgi:application
Environment="DJANGO_SETTINGS_MODULE=config.settings.settings_prod"

[Install]
WantedBy=multi-user.target

################## Prod gunicorn.socket #######################
root@django-lighthouse-tutors:/etc/systemd/system# cat gunicorn.socket
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target


###################### Prod redis.service #########################
root@django-lighthouse-tutors:/etc/systemd/system# cat redis.service
[Unit]
Description=Advanced key-value store
After=network.target
Documentation=http://redis.io/documentation, man:redis-server(1)

[Service]
Type=notify
ExecStart=/usr/bin/redis-server /etc/redis/redis.conf --supervised systemd --daemonize no
PIDFile=/run/redis/redis-server.pid
TimeoutStopSec=0
Restart=always
User=redis
Group=redis
RuntimeDirectory=redis
RuntimeDirectoryMode=2755

UMask=007
PrivateTmp=yes
LimitNOFILE=65535
PrivateDevices=yes
ProtectHome=yes
ReadOnlyDirectories=/
ReadWritePaths=-/var/lib/redis
ReadWritePaths=-/var/log/redis
ReadWritePaths=-/var/run/redis

NoNewPrivileges=true
CapabilityBoundingSet=CAP_SETGID CAP_SETUID CAP_SYS_RESOURCE
MemoryDenyWriteExecute=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictRealtime=true
RestrictNamespaces=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX

# redis-server can write to its own config file when in cluster mode so we
# permit writing there by default. If you are not using this feature, it is
# recommended that you replace the following lines with "ProtectSystem=full".
ProtectSystem=true
ReadWriteDirectories=-/etc/redis

[Install]
WantedBy=multi-user.target
Alias=redis.service
####################Prod daphne.service##################################
root@django-lighthouse-tutors:/etc/systemd/system# cat daphne.service
[Unit]
Description=Daphne WebSocket Server
After=network.target

[Service]
User=django
Group=www-data
WorkingDirectory=/home/django/django_edu/tutors_django
ExecStart=/home/django/.cache/pypoetry/virtualenvs/django-edu-NVeF266P-py3.10/bin/daphne --b 0.0.0.0 -p 8001 config.asgi:application
Restart=always

[Install]
WantedBy=multi-user.target

############# Prod nginx.conf ###########################
ser django www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
#load_module /usr/lib/nginx/modules/ngx_http_geoip2_module.so;
#load_module modules/ngx_http_geoip_module.so;
events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;


                include /etc/nginx/mime.types;
        default_type application/octet-stream;
        ##
        # GeoIP
        ## 
        geoip_country /usr/share/GeoIP/GeoIP.dat;
        map $geoip_country_code $blocked_country {
            default 0;
            TH 1;  # Block Thailand
        }
        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'ECDHE-ECDSA:AES128-GCM-SHA256:ECDHE-RSA:AES128-GCM-SHA256';

        ssl_ecdh_curve secp384r1;
        proxy_headers_hash_max_size 1024;
        proxy_headers_hash_bucket_size 128;

        # Logging Settings
        ##

        log_format custom '$remote_addr - $remote_user [$time_local] "$request" '
                     '$status $body_bytes_sent "$http_referer" '
                     '"$http_user_agent" "$http_x_forwarded_for"';

        access_log /var/log/nginx/access.log custom;
        error_log /var/log/nginx/error.log info;

        ##
        # Gzip Settings
        ##

        gzip on;

                # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/jav>

        ##
        # Virtual Host Configs
        ##

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}
