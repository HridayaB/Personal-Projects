import time
import datetime
print("Dog treat tracker")

daily_limit = None
limit = input("Would you like to set a daily treat limit? (Enter 'yes' or 'no') ")
if limit.lower() == "yes":
    daily_limit = int(input("What is your daily treat limit? "))

total = 0
while True:
    if total == daily_limit:
        more_treats = input("You have reached your treat limit for the day. Would you like to keep giving more treats? (Enter 'yes' or 'no') ")
        if more_treats.lower() == "no":
            break
    elif total > daily_limit:
        more_treats = input("You have exceeded your treat limit for the day. Would you like to keep giving more treats? (Enter 'yes' or 'no') ")
        if more_treats.lower() == "no":
            break
    treats = int(input("How many treats are you planning to give right now? "))
    total += treats
    #if time.localtime().tm_hour == 23:

def count_treats(treats):
    total = 0
    for treat in treats:
        total += treat
    return total

print(f"Today on {datetime.date.today()}, you gave your dog {count_treats([total])} treats.")
