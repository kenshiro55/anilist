import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'anilist';
  
    constructor(private route: ActivatedRoute, private router: Router,     private location: Location) { 
    }
  
    ngOnInit() {
		let token = null
		
		if(window.location.search !== "") {
			let search = window.location.search
			
			var queryDict = {}
			search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
			
			if(queryDict.token !== undefined) {
				token = queryDict.token
			}
			
			let href = window.location.href
			this.location.replaceState('/', '')
		}
		
	}
  
  
}
