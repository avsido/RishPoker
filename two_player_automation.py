from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Setup Chrome options to start two browser instances
chrome_options = webdriver.ChromeOptions()

# Start the first browser instance
driverA = webdriver.Chrome(options=chrome_options)
driverA.get("http://localhost:8080")

# Start the second browser instance
driverB = webdriver.Chrome(options=chrome_options)
driverB.get("http://localhost:8080")

# Assuming you have already clicked the "startDoubleGame" button manually

# Define wait times
waitA = WebDriverWait(driverA, 20)
waitB = WebDriverWait(driverB, 20)

# Function to wait for and click an element
def click_element(driver, wait, class_name):
    try:
        element = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, class_name)))
        element.click()
        print(f"Clicked element with class name {class_name} on {driver.name}")
    except Exception as e:
        print(f"Error clicking element with class name {class_name} on {driver.name}: {e}")

# Main loop to alternate clicks between the two players
for i in range(24):
    click_element(driverA, waitA, "cardDivPlayerAPlay")
    click_element(driverB, waitB, "cardDivPlayerAPlay")

# # Close the browser instances
# driverA.quit()
# driverB.quit()
