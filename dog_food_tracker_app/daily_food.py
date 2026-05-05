import datetime

print("Dog food tracker")

daily_limit_in_number_of_meals = None
daily_limit_in_grams = None
limit = input("Would you like to set a daily food limit? (Enter 'yes' or 'no') ")

if limit.lower() == "yes":
    daily_limit_in_number_of_meals = int(input("How many meals do you want to feed your dog each day? "))
    daily_limit_in_grams = int(input("What is your daily food limit in grams? "))

    total_grams = 0
    total_meals = 0
    while True:
        total_meals += 1
        if total_meals == daily_limit_in_number_of_meals:
            more_food = input("You have reached your meal limit for the day. Would you like to keep giving more food to your dog? (Enter 'yes' or 'no') ")
            if more_food.lower() == "no":
                break
        elif total_meals > daily_limit_in_number_of_meals:
            more_food = input("You have exceeded your meal limit for the day. Would you like to keep giving more food to your dog? (Enter 'yes' or 'no') ")
            if more_food.lower() == "no":
                break
        if total_grams == daily_limit_in_grams:
            more_food = input("You have reached your food limit for the day. Would you like to keep giving more food to your dog? (Enter 'yes' or 'no') ")
            if more_food.lower() == "no":
                break
        elif total_grams > daily_limit_in_grams:
            more_food = input("You have exceeded your food limit for the day. Would you like to keep giving more food to your dog? (Enter 'yes' or 'no') ")
            if more_food.lower() == "no":
                break
        
        print(f"Meal {total_meals}: ")
        food = int(input("How many grams of food are you planning to give to your dog right now? "))
        total_grams += food

    print(f"Today on {datetime.date.today()}, you gave your dog {total_meals} meals and {total_grams} grams of food.")

if limit.lower() == "no":
    print("You have chosen not to set a daily food limit. Please remember to feed your dog a healthy amount of food, experts recommend feeding adult dogs twice a day, and puppies three to four times a day.")
    tracker = input("Would you still like to track how much food you are giving to your dog? (Enter 'yes' or 'no') ")

    if tracker.lower() == "yes":
        total_grams = 0
        total_meals = 0
        while True:
            total_meals += 1
            food = int(input("How many grams of food are you planning to give to your dog right now? "))
            total_grams += food
            if total_meals > 2:
                more_food = input("You have exceeded the recommended number of meals for the day, would you like to keep giving more food to your dog? (Enter 'yes' or 'no') ")
                if more_food.lower() == "no":
                    break
            
    print(f"Today on {datetime.date.today()}, you gave your dog {total_meals} meals and {total_grams} grams of food.")
