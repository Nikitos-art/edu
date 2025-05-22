#!/usr/bin/env python3
import re
import csv
import sys
#./parse_nginx_logs.py /var/log/nginx/access.log ./logs.txt
def extract_browser(user_agent):
    """Extract the browser name from the user-agent string."""
    # Check for common browser patterns
    browser_patterns = [
        (r"Firefox/([0-9\.]+)", "Firefox"),
        (r"Chrome/([0-9\.]+)", "Chrome"),
        (r"Safari/([0-9\.]+)", "Safari"),
        (r"Opera/([0-9\.]+)", "Opera"),
        (r"MSIE ([0-9\.]+)", "Internet Explorer"),
        (r"Trident/.*rv:([0-9\.]+)", "Internet Explorer"),
        (r"Edge/([0-9\.]+)", "Edge"),
        (r"Mobile", "Mobile"),
    ]

    for pattern, browser in browser_patterns:
        if re.search(pattern, user_agent):
            return browser
    return "Unknown"


def process_nginx_log(input_file, output_file):
    """Process nginx log file and save the cleaned data to a new file."""
    with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
        writer = csv.writer(outfile, delimiter='\t')
        writer.writerow(["IP", "Time", "Request", "Status", "Size", "Referrer", "Browser"])

        for line in infile:
            # Regex to match the NGINX log format
            match = re.match(r'(\S+) - - \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)" "([^"]*)"', line)
            if match:
                ip, timestamp, method, url, protocol, status, size, referrer, user_agent, _ = match.groups()

                # Extract the hour and minute from the timestamp
                time = timestamp.split(":")[1] + ":" + timestamp.split(":")[2]

                # Extract browser information
                browser = extract_browser(user_agent)

                # Write the cleaned data to the output file
                writer.writerow([ip, time, method + " " + url, status, size, referrer, browser])

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python parse_nginx_logs.py <input_log_file> <output_file>")
    else:
        input_log_file = sys.argv[1]
        output_file = sys.argv[2]
        process_nginx_log(input_log_file, output_file)

