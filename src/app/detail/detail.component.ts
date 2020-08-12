import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Entry } from '../library';
import { FormGroup, FormControl } from '@angular/forms';
import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  formGroup: FormGroup

  constructor(public dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Entry,
    private service: AnimeService) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      "status": new FormControl(this.data.status),
      "score": new FormControl(this.data.score),
      "progress": new FormControl(this.data.progress)
    })
  }

  save() {
    const status: string = this.formGroup.controls["status"].value
    const score: number = this.formGroup.controls["score"].value
    const progress: number = this.formGroup.controls["progress"].value

    this.service.updateAnime(this.data.id, status, score, progress)
      .subscribe(data => this.dialogRef.close({status: data["data"]["SaveMediaListEntry"]["status"], 
                              score: +data["data"]["SaveMediaListEntry"]["score"], 
                              progress: +data["data"]["SaveMediaListEntry"]["progress"]})
        )
  }

}
