import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ViewChildren, ViewContainerRef } from '@angular/core';
import { AnimeService } from '../anime.service'
import { User } from '../user'
import { tap, switchMap, flatMap, filter, toArray, map, debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { Entry, Status } from '../library';
import { MatTableDataSource, MatTable, MatRow } from '@angular/material/table';
import {  fromEvent, Observable, of } from 'rxjs';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MediaSearch } from '../search';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent } from '../detail/detail.component';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild('nameFilterInput', { static: true }) nameFilterInput: ElementRef;
  @ViewChildren("tableRow", { read: ViewContainerRef }) containers;
  

  private user: User
  filterStatus = ""
  private filterName = ""
  filteredAnimes: MediaSearch[]

  statuses: Status[] = []
  entries: Entry[]
  dataSource: MatTableDataSource<Entry>

  selectionCover: string
  selectionCoverLeft: string
  selectionCoverTop: string

  displayedColumns = ["cover", "title", "progress", "actions"]

  constructor(private service: AnimeService, private changeDetectorRefs: ChangeDetectorRef,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.service.getUser()
      .pipe(
        tap(user => this.user = user),
        switchMap(user => this.service.getLibrary(user.id)),
        /*flatMap(library => library.data.MediaListCollection.lists),
        filter(lists => lists.isCustomList === false),
        tap(lists => {
          if(lists.entries.length > 0) {
            const name = lists.name
            const code = lists.entries[0].status
            const count = lists.entries.length
            this.statuses.push({name: name, code: code, count: count})
          }
        }),
        map(lists => lists.entries),
        flatMap(entries => entries),
        toArray(),
        map(entries => entries.sort((entry1, entry2) =>
          entry1.media.title.userPreferred.localeCompare(entry2.media.title.userPreferred)))*/
        map(library => {
          let entries: Entry[] = []

          library.data.MediaListCollection.lists.forEach(list => {
            if(list.isCustomList === false) {
              if(list.entries.length > 0) {
                const name = list.name
                const code = list.entries[0].status
                const count = list.entries.length
                this.statuses.push({name: name, code: code, count: count})
              }
    
              entries.push(...list.entries)
            }
          })

          entries.sort((entry1, entry2) =>
            entry1.media.title.userPreferred.localeCompare(entry2.media.title.userPreferred))
          
          return entries
        })
      )
      .subscribe(entries => {
        this.createDataSource(entries)

        fromEvent(this.searchInput.nativeElement, 'keyup')
        .pipe(
          map((event: any) => {
            return <string>event.target.value.trim()
          }),
          filter(value => value.length == 0 || value.length >= 3),
          debounceTime(500),
          distinctUntilChanged()
        ).subscribe((text: string) => {
          this.service.search(text)
            .subscribe(data => this.filteredAnimes = data)
        })

        fromEvent(this.nameFilterInput.nativeElement, 'keyup')
        .pipe(
          map((event: any) => {
            return <string>event.target.value.trim()
          }),
          filter(value => value.length == 0 || value.length >= 3),
          debounceTime(500),
          distinctUntilChanged()
        ).subscribe((text: string) => {
          this.filterName = text.trim().toLowerCase()
          this.dataSource.filter = JSON.stringify({
            status: this.filterStatus,
            name: this.filterName
          })
        })        
      })
  }

  getTotalProgress() {
    let count = 0
    let totalCount = 0

    this.dataSource.filteredData.forEach(entry => {
      if(entry.progress) {
        count += entry.progress
      }
      if(entry.media.episodes) {
        totalCount += entry.media.episodes
      }
    })

    return count + "/" + totalCount
  }

  mouseOverRow(index: number, row: Entry) {
    let rect = this.containers.toArray()[index].element.nativeElement.getBoundingClientRect()
    this.selectionCoverLeft = (rect.x - 150 - 5) + "px"
    this.selectionCoverTop = (rect.y - 100 + (rect.height/2)) + "px"
    this.selectionCover = row.media.coverImage.large
  }
  mouseLeaveRow(row: Entry) {
    this.selectionCover = null
  }

  openDetail(row: Entry) {
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '100%',
      height: 'auto',
      data: row
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const status: string = result.status
        const score: number = result.score
        const progress: number = result.progress
  
        row.status = status
        row.score = score
        row.progress = progress
  
        let entries = this.dataSource.data
        this.createDataSource(entries)
      }
    })
  }

  /*applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.filterName = filterValue.trim().toLowerCase()
    this.dataSource.filter = JSON.stringify({
      status: this.filterStatus,
      name: this.filterName
    })
  }*/

  changeStatus(event: MatButtonToggleChange) {
    this.filterStatus = event.value
    this.dataSource.filter = JSON.stringify({
      status: this.filterStatus,
      name: this.filterName
    })
  }

  searchMediaSelected(event: MatAutocompleteSelectedEvent) {
   //console.log("xxx", event.option.value, event.option.id) 
  }

  addAnime(id: number) {
    this.service.addAnime(id)
      .subscribe(r => this.initList(),
        error => console.log(error))
  }

  deleteAnime(event, id: number) {
    event.stopPropagation()
    this.service.deleteAnime(id)
      .subscribe(r => {
        let entries = this.dataSource.data.filter(entry => entry.id !== id)
        this.createDataSource(entries)
      },
        error => console.log(error))
  }


  private createDataSource(entries: Entry[]) {
    this.entries = entries
    this.dataSource = new MatTableDataSource(entries)
    
    this.dataSource.filterPredicate = (entry: Entry, filter: string) => {
      const filt = JSON.parse(filter)
      let value = true
      if (filt.status !== "") {
        value = value && entry.status === filt.status
      }
      if (filt.name !== "") {
        value = value && entry.media.title.userPreferred.toLowerCase().indexOf(filt.name) >= 0
      }
      return value
    }
  }

  private initList() {
    of(this.user)
      .pipe(
        tap(user => this.user = user),
        switchMap(user => this.service.getLibrary(user.id)),
        map(library => {
          let entries: Entry[] = []
          this.statuses = []

          library.data.MediaListCollection.lists.forEach(list => {
            if(list.isCustomList === false) {
              if(list.entries.length > 0) {
                const name = list.name
                const code = list.entries[0].status
                const count = list.entries.length
                this.statuses.push({name: name, code: code, count: count})
              }
    
              entries.push(...list.entries)
            }
          })

          entries.sort((entry1, entry2) =>
            entry1.media.title.userPreferred.localeCompare(entry2.media.title.userPreferred))
          
          return entries
        })
      )
      .subscribe(entries => {
        this.createDataSource(entries)
      })        

  }

}