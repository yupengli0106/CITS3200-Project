from app import db
from app.models import UserModel
import re

def init_admin():
    try:
        # check how many admin accounts are there in the database
        admin = UserModel.query.filter_by(admin=True)
        count = admin.count()
        print('Do you want to initialize an admin account now?', 'current admin account count: ' + str(count))
        print('Please enter "y" or "n": ')
        answer = input()
        if answer == 'y' or answer == 'Y':
            emailTaken = True
            while emailTaken:
                print('Please enter the email address of the admin account: ')
                email = input()
                # validate the email address through regex
                if re.match(r"[^@]+@[^@]+\.[^@]+", email):
                    user = UserModel.query.filter_by(email=email).first()
                    if user:
                        print('\n******The email address is already taken, please try another one ******')
                    else:
                        emailTaken = False
                else:
                    print('\n******The email address is not valid, please try another one ******')

            usernameTaken = True
            while usernameTaken:
                print('Please enter the username of the admin account: ')
                username = input()
                # username cannot be empty or only spaces
                if not re.match(r"^\s*$", username):
                    usernameTaken = False               
                else:
                    print('\n****** The username is not valid, please try another one ******')
            
            passwordTaken = True
            while passwordTaken:
                print('Please enter the password of the admin account: ')
                print('(the password should be at least 8 characters long including one uppercase letter, one lowercase letter, one number and one special character)')
                password = input()
                # validate the password through regex
                if re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", password):
                    passwordTaken = False               
                else:
                    print('\n****** The password is not valid, please try another one ******')

            # double check the password
            passwordTaken2 = True
            while passwordTaken2:
                print('Please enter the password again: ')
                password2 = input()
                if password == password2:
                    passwordTaken2 = False               
                else:
                    print('\n****** The password is not the same, please try again ******')

            # create the admin account 
            admin_user = UserModel(email=email, username=username, admin=True, UnitCoordinator=True)
            admin_user.encode_password(password)
            db.session.add(admin_user)
            db.session.commit()
            print('\n###### Admin account has been initialized successfully! ######\n')
        elif answer == 'n' or answer == 'N':
            print('\n###### Admin account has not been initialized! ######'+'\n')
        else:
            print('\n'+'****** Wrong inputs, please enter either "y" or "n" ******')
            init_admin()
    except Exception as e:
        print('\n'+str(e)+'\n')