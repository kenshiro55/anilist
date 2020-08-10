import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
	title = 'anilist';
  
	constructor(private router: Router) { 
    }
	
    ngAfterViewInit() {
		// http://localhost:4200/#error=access_denied&state=
		// http://localhost:4200/#access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImM4YjI5OWFhZDllNTFhZmViYjk4NGIwZDEzOTQ4MzA1MTNlMjc0YWU1YTMxOTE0MDYyOTMwMGNhMTlhY2FlNTYzOGRjM2FhYzJmMTYzY2E3In0.eyJhdWQiOiIzNzQ5IiwianRpIjoiYzhiMjk5YWFkOWU1MWFmZWJiOTg0YjBkMTM5NDgzMDUxM2UyNzRhZTVhMzE5MTQwNjI5MzAwY2ExOWFjYWU1NjM4ZGMzYWFjMmYxNjNjYTciLCJpYXQiOjE1OTQ3MzIzMDYsIm5iZiI6MTU5NDczMjMwNiwiZXhwIjoxNjI2MjY4MzA2LCJzdWIiOiI4MTk5MSIsInNjb3BlcyI6W119.hpYfulKrx5xnkQLjI1OIf8qoUmvkhoEcFyv6ZPgJTUsQJvbkdFO_TTmevp87EHnxukGHsvDyIqzy-40rHtvp_Wbdx0UgiRqtYS4r-KLAG1GrfHUI1GLRtXvLJfHTx3WFUIq9dRDLy20BgTE-418gyv7W5KEgB3Z59gGJKFow2RZ5WrnlAopxagIMegYBxUhtfigwdToHfJSvY_OWsOuhx2dyInwG07lZjF01D5WX-GFeSb_BrnQ8YUrJFMvJGqp1ct8skSLKkjttt_7o1ihHKMy03RludQNY4YvLJPE92ORk1RWAKp9MmRzYTVcA-l3rKXw4pmWuoDN1-ql304zy2bg2jiNuN9T4b6TWhYGRwGac4RniPVQVczUnTCLqeUJRu3bA93bW7QX0CvKM2SPOhXwcFENtAz8zJfbECCHgBRF1qrUhwQHV4retsBiz6mJjlP_lPKGhjSYIJythP6rInpTK1vfeI48tAXNAkFsxY3FHqo0WeR9wpV9OGwywDSsAi2ZznQCYH2Zyrzb_xq7VJgyIcRD9yWcsexhhGy0052zRtJGcs6Vwm94o9yAhiFAVqhJLd2t8Bi9P73fEIV0RpOB4s_XZ0ILby4ktpoDjSvGnQSBbsBYt3Rg5MivYSGWBrcpujz6uaMngk8JzscgLuOcAX2VLq7NOMv_U3aPBJlY&token_type=Bearer&expires_in=31536000
		if(window.location.hash !== "") {
			let hash = window.location.hash
			
			var queryDict = {}
			hash.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
			
			let error = queryDict["error"]
			let token = queryDict["access_token"]

			if(error !== undefined) {
				// redirect page erreur
				return 
			} else if(token !== undefined) {
				localStorage.setItem("token", token)
				// redirect library
			}
		}

		let token = localStorage.getItem("token")
		if(token) {
			this.router.navigate(['library'])
		} else {
			window.location.href = `https://anilist.co/api/v2/oauth/authorize?client_id=${environment.clientId}&response_type=token`
		}
		
	}
  
}
