from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
import time

ipLH = "localhost"
ipHome = "10.0.0.6"
ipWork = "10.0.0.217"
ipShakury = "192.168.50.81"
ipOfer = ""

driver = webdriver.Chrome()
driver.get("http://" +ipHome+ ":8080")

try:
    def retry_click(element, max_attempts=5):
        for attempt in range(max_attempts):
            try:
                element.click()
                return True 
            except StaleElementReferenceException:
                time.sleep(1)
                element = driver.find_element(By.CLASS_NAME, 'cardDivPlayerAPlay')
        return False  

    wait = WebDriverWait(driver, 10)

    start_button = wait.until(EC.element_to_be_clickable((By.ID, "start_game_butt")))
    if retry_click(start_button):
        print("Clicked start button successfully.")
        
        card_divs = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, 'cardDivPlayerAPlay')))
        
        print(f"Found {len(card_divs)} card divs.")

        # Click on each card div five times
        for card_index, card in enumerate(card_divs):
            for click_count in range(5):
                if click_count < 4: 
                    if retry_click(card):
                        print(f"Clicked card {card_index + 1} successfully, attempt {click_count + 1}.")
                    else:
                        print(f"Failed to click card {card_index + 1}, attempt {click_count + 1} after retries.")

    else:
        print("Failed to click start button after retries.")

    while True:
        time.sleep(10) 

except TimeoutException:
    print("Timeout occurred while waiting for elements.")
except Exception as e:
    print(f"An error occurred: {str(e)}")

# Commenting out driver.quit() to keep the session open
# finally:
#     driver.quit()
