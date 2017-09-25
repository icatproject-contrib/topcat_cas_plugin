
# Topcat CAS Plugin

Authenticate with CAS (Central Authentication Service) on Topcat.

## Installation

The first you need to do is install the Icat authentication plugin on your Icat:

* https://github.com/icatproject-contrib/authn.cas

Once this is complete you'll need to build a copy of this plugin:

	git clone git@github.com:icatproject-contrib/topcat_cas_plugin.git
	cd topcat_cas_plugin
	mvn clean install

next you'll need to install it on your Java EE container (e.g. Payara/Glassfish):

	asadmin deply topcat_cas_plugin-0.1.0.war

you'll need to add the following authenticationType tp Topcat's topcat.json:

	"authenticationTypes": [
		{
			"type": "cas",
			"external": true,
			"casUrl": "https://auth.diamond.ac.uk/cas"
		}
	]

and then enable it it in the plugins section:

	"plugins": [
		"https://icat.diamond.ac.uk/topcat_cas_plugin"
	]

finally you need to redeploy Topcat:

	#in Topcat's install directory
	./setup install


