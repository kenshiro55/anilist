export interface Library {
    "data": Data
}

export interface Data {
    "MediaListCollection":  MediaListCollection
}

export interface MediaListCollection {
    "lists": List[]
}

export interface List {
    "isCustomList": boolean,
    "name": string,
    "entries": Entry[]
}

export interface Entry {
    "id": number,
    "mediaId": number,
    "notes": string,
    "private": boolean,
    "progress": number,
    "repeat": number,
    "score": number,
    "status": string,
    "updatedAt": number,
    "startedAt": ADate,
    "completedAt": ADate,
    "media": Media
}

export interface ADate {
    "year": number,
    "month": number,
    "day": number
}

export interface Media {
    "episodes": number,
    "format": string,
    "siteUrl": string,
    "status": string,
    "coverImage": Cover,
    "title": Title,
    "bannerImage": string
}

export interface Cover {
    "large": string
}
export interface Title {
    "userPreferred": string,
    "romaji": string
}

export interface Status {
    "name": string,
    "code": string,
    "count": number
}