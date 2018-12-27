# DeliveryPizza
# users can create their details by signing in and the data posted to the /users uri 
to create user do a post, to edit user use put, to delete user details do a delete, to get user details use the get method. 
This has been implemented in the users.js file.
Note that a valid token is required for all cases. 
#sample get
http://localhost:3003/users?emailaddress=mwanzias@gmail.com

sample post:
http://localhost:3003/users

sample post body.
{
    "name": "stephen Mwanzia",
    "emailAddress": "mwanzia@gmail.com",
    "streetAddress": "waiyaki way Mariguini",
    "termsAgreement" : true,
    "userPassword" : "userpassword1",
	"usertype":"normal"
}

To create an administrator there will be an explict call to the usertype = admin, 
authentication and verification will be build on this later on.

The priviledges the admin has is only that they can add menu items for other users to see.
on the API.

#order charging upon posting returns the following. 
#it accepts application/json and returns application/json 
post to /orders  {
"emailaddress" :"emailaddress@gmail.com"
}
   
The above email address needs to be valid and already logged in with a token. 
The token is put in the headers as token and when it is invalid it will through errors.


{
    "request_id": "req_AkhbhgQdqlUPmb",
    "amount": 192,
    "status": "succeeded",
    "currency": "usd"
}


#LOGIN

users can log in after their accounts are successfully created by invoking 
http://localhost:3003/tokens
with a json document 

{
   
    "emailAddress": "mwanzias@gmail.com",
    "userPassword" : "passme1"
   
}

The response will be as follows:

{
    "emailAddress": "mwanzias@gmail.com",
    "id": "r1n1eud0oghc2ao1vj8",
    "expires": 1545870560970
}

Where the ID in the above response is the token that will be used in subsequent requests thereafter. 




