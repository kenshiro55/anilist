import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { Library } from './library';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, flatMap, toArray, switchMap } from 'rxjs/operators';
import { MediaSearch } from './search';

const URL = "https://graphql.anilist.co/"

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  constructor(private httpClient: HttpClient) { }

  public getUser(): Observable<User> {
    const body = `{"query":"query {Viewer {id, name, avatar {large} } }", "variables": null }`
    const token = localStorage.getItem("token")

    return this.httpClient.post<any>(URL,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        observe: 'body',
        responseType: 'json',
      }
    ).pipe(
      map(o => <User>{
        id: o.data.Viewer.id,
        name: o.data.Viewer.name,
        avatar: o.data.Viewer.avatar.large,
      })
    )
  }


  public getLibrary(userId: number): Observable<Library> {
    const body = '{"query":"query { ' +
      `  MediaListCollection(type: ANIME, userId:${userId}) {` +
      '    lists {' +
      '      isCustomList, name, ' +
      '      entries { ' +
      '        id, mediaId, status, score(format:POINT_100), progress, private, ' +
      '        startedAt {year, month, day}, completedAt {year, month, day}, ' +
      '        updatedAt, notes, repeat, media { ' +
      '          title{userPreferred, romaji}, siteUrl, episodes, coverImage{large}, format, status, bannerImage, duration ' +
      '        }' +
      '      }' +
      '    }' +
      '  }' +
      '}", "variables":null}'
    const token = localStorage.getItem("token")

    return this.httpClient.post<Library>(URL,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        observe: 'body',
        responseType: 'json',
      }
    )
  }

  public search(name: string): Observable<MediaSearch[]> {
    const body = '{"query":" { ' +
      '  Page(page: 0, perPage:50) {' +
      `    media(type: ANIME, search:\\"${name}\\") {` +
      '      id, title {romaji}, coverImage {large}' +
      '    }' +
      '  }' +
      '}", "variables":null}'

    return this.httpClient.post<MediaSearch[]>(URL,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        observe: 'body',
        responseType: 'json',
      }
    ).pipe(
      flatMap(data => data["data"]["Page"]["media"]),
      map(data => <MediaSearch>{
        id: data["id"], title: data["title"]["romaji"],
        coverImage: data["coverImage"]["large"]
      }),
      toArray()
    )
  }

  public addAnime(id: number) {
    const bodyQuery = '{"query":"query { ' +
      `  Media(id:${id}, type:ANIME) {` +
      '    mediaListEntry {id}' +
      '  }' +
      '}", "variables":null}'
    const bodyMutation = '{"query":"mutation { ' +
      `  SaveMediaListEntry(mediaId:${id}, status:PLANNING, progress:0) {` +
      '    id' +
      '  }' +
      '}", "variables":null}'
    const token = localStorage.getItem("token")

    return this.httpClient.post(URL,
      bodyQuery,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        observe: 'body',
        responseType: 'json'
      }
    ).pipe(
      switchMap(res => {
        if (res["data"] && res["data"]["Media"] && !res["data"]["Media"]["mediaListEntry"]) {
          return this.httpClient.post(URL,
            bodyMutation,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              observe: 'body',
              responseType: 'json'
            }
          )
        }
        throwError("Already added")
      })
    )
  }

  public updateAnime(id: number, status: string, score: number, progress: number) {
    const bodyMutation = '{"query":"mutation { ' +
      `  SaveMediaListEntry(id:${id}, status:${status}, progress:${progress}, scoreRaw:${score}) {` +
      '    id, status, score(format: POINT_100), progress' +
      '  }' +
      '}", "variables":null}'
    const token = localStorage.getItem("token")

    return this.httpClient.post(URL,
      bodyMutation,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        observe: 'body',
        responseType: 'json'
      }
    )
  }

  public deleteAnime(id: number) {
    const bodyMutation = '{"query":"mutation { ' +
      `  DeleteMediaListEntry(id:${id}) {` +
      '    deleted' +
      '  }' +
      '}", "variables":null}'
    const token = localStorage.getItem("token")

    return this.httpClient.post(URL,
      bodyMutation,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        observe: 'body',
        responseType: 'json'
      }
    )

  }



}
