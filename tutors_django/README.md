# django_edu

Fake users:

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
1. git pull
2. git pull origin main
---------------------------------------------------------------------------------
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

Error occured:
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Error while running nginx -c /etc/nginx/nginx.conf -t.

nginx: [warn] could not build optimal proxy_headers_hash, you should increase either proxy_headers_hash_max_size: 512 or proxy_headers_hash_bucket_size: 64; ignoring proxy_headers_hash_bucket_size
nginx: [emerg] no "ssl_certificate" is defined for the "listen ... ssl" directive in /etc/nginx/sites-enabled/tutors_django:41
nginx: configuration file /etc/nginx/nginx.conf test failed


