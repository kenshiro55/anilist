import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ViewChildren, ViewContainerRef } from '@angular/core';
import { AnimeService } from '../anime.service'
import { User } from '../user'
import { tap, switchMap, filter, map, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { Entry, Status } from '../library';
import { MatTableDataSource } from '@angular/material/table';
import {  fromEvent,  of } from 'rxjs';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MediaSearch } from '../search';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent } from '../detail/detail.component';
import { MatSelectChange } from '@angular/material/select';

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

  minYear: number
  maxYear: number

  filterMinYear: number
  filterMaxYear: number

  filterMinYears: number[]
  filterMaxYears: number[]

  statuses: Status[] = []
  entries: Entry[]
  dataSource: MatTableDataSource<Entry>

  selectionCover: string
  selectionCoverLeft: string
  selectionCoverTop: string

  selectionData: any
  selectionDataLeft: string
  selectionDataTop: string

  displayedColumns = ["cover", "title", "score", "progress", "actions"]

  constructor(private service: AnimeService, private changeDetectorRefs: ChangeDetectorRef,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.service.getUser()
      .pipe(
        tap(user => this.user = user),
        switchMap(user => this.service.getLibrary(user.id)),
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

          entries.forEach(entry => {
            if(!this.minYear || this.minYear > entry.media.seasonYear) {
              this.minYear = entry.media.seasonYear
            }
            if(!this.maxYear || this.maxYear < entry.media.seasonYear) {
              this.maxYear = entry.media.seasonYear
            }
          })

          this.initYearLists()

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
            name: this.filterName,
            from: this.filterMinYear,
            to: this.filterMaxYear
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

  getTotalTime() {
    let total = 0

    this.dataSource.filteredData.forEach(entry => {
      if(entry.progress && entry.media.duration) {
        total += (entry.progress * entry.media.duration)
      }
    })

    return total
  }


  mouseOverRow(index: number, row: Entry) {
    let rect = this.containers.toArray()[index].element.nativeElement.getBoundingClientRect()
    this.selectionCoverLeft = (rect.x - 150 - 5) + "px"
    this.selectionCoverTop = (rect.y - 100 + (rect.height/2)) + "px"
    this.selectionCover = row.media.coverImage.large

    this.selectionData = `Title: ${row.media.title.romaji}<br>
    Year: ${row.media.seasonYear}<br>
    Note: ${row.score}/100`

    this.selectionDataLeft = rect.x + "px"
    this.selectionDataTop = (rect.y - 100 + (rect.height/2)) + "px"

  }
  mouseLeaveRow(row: Entry) {
    this.selectionCover = null
    this.selectionData = null
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
      name: this.filterName,
      from: this.filterMinYear,
      to: this.filterMaxYear
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
      if(filt.from) {
        value = value && entry.media.seasonYear >= filt.from
      }
      if(filt.to) {
        value = value && entry.media.seasonYear <= filt.to
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

  changeFromYear(event: MatSelectChange) {
    this.filterMinYear = typeof event.value === "number" 
                          ? event.value
                          : undefined

    this.initYearLists()

    this.dataSource.filter = JSON.stringify({
      status: this.filterStatus,
      name: this.filterName,
      from: this.filterMinYear,
      to: this.filterMaxYear
    })
  }

  changeToYear(event: MatSelectChange) {
    this.filterMaxYear = typeof event.value === "number" 
                          ? event.value
                          : undefined

    this.initYearLists()

    this.dataSource.filter = JSON.stringify({
      status: this.filterStatus,
      name: this.filterName,
      from: this.filterMinYear,
      to: this.filterMaxYear
    })
  }

  private initYearLists() {
    let min = []
    let max = []

    let from = this.filterMinYear === undefined ? this.minYear : this.filterMinYear
    let to = this.filterMaxYear === undefined ? this.maxYear : this.filterMaxYear

    for(let y = this.minYear; y <= to; y++) {
      min.push(y)
    }
    for(let y = from; y <= this.maxYear; y++) {
      max.push(y)
    }

    this.filterMinYears = min
    this.filterMaxYears = max
  }

}