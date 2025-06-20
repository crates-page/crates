import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Crate } from '../shared/model/crate.model';
import { Album } from '../../library/shared/model/album.model';
import { DEFAULT_PAGE_SIZE, Pageable } from '../../shared/model/pageable.model';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadCrate } from '../store/actions/load-crates.actions';
import {
  selectAllCrateAlbums,
  selectCrate, selectCrateAlbumListType,
  selectCrateAlbumsHasNextPage,
  selectCratesListType
} from '../store/selectors/crate.selectors';
import { loadCrateAlbums, reloadCrateAlbums, toggleCrateAlbumListType } from '../store/actions/crate-album.actions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RemoveAlbumModalComponent } from '../shared/modal/remove-album/remove-album-modal.component';
import { ListType } from '../../shared/model/list-type.model';

@Component({
  selector: 'crates-crate',
  templateUrl: './crate.component.html',
  styleUrls: ['./crate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrateComponent implements OnInit, OnDestroy {
  page: Pageable;
  crate: Crate;
  albums: Album[] = [];
  destroy$ = new Subject<boolean>();
  hasNextPage$: Observable<boolean>;

  longPressed: Album;
  crateListType: ListType;
  search: string;


  constructor(private activatedRoute: ActivatedRoute,
              private store: Store,
              private modal: NgbModal,
              private router: Router) {
    this.loadCrate();
    this.page = Pageable.of(0, DEFAULT_PAGE_SIZE);
    this.store.select(selectCrate).pipe(
      tap(crate => {
        this.crate = crate;
        this.albums = [];
        if (!!crate) {
          this.store.dispatch(loadCrateAlbums({
            crate: this.crate,
            pageable: this.page,
          }));
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.store.select(selectAllCrateAlbums).pipe(
      tap(albums => {
        this.albums = albums.map(crateAlbum => crateAlbum.album);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.hasNextPage$ = this.store.select(selectCrateAlbumsHasNextPage);

    this.store.select(selectCrateAlbumListType).pipe(
      tap(listType => this.crateListType = listType),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
    this.albums = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private loadCrate(): void {
    const id = this.activatedRoute.snapshot.params['id'];
    this.store.dispatch(loadCrate({ id }));
  }

  loadMore() {
    this.page = this.page.nextPageable();
    this.store.dispatch(loadCrateAlbums({ crate: this.crate, pageable: this.page }));
  }

  getArtistNames(album: Album) {
    return album.artists.map(artist => artist.name).join(', ');
  }

  // https://open.spotify.com/album/2TklWyQdmNHg7d2Xmam8G8?si=660e00a203414f19
  openAlbum(album: Album) {
    if (this.longPressed?.id === album.id) {
      this.longPressed = undefined;
      return;
    }
    window.location.href = `https://open.spotify.com/album/${album.spotifyId}`;
  }

  removeAlbum($event: MouseEvent, album: Album) {
    if (this.longPressed === album) {
      return;
    }
    this.longPressed = album;
    if ($event) {
      $event.stopPropagation();
      $event.stopImmediatePropagation();
    }
    const modalRef = this.modal.open(RemoveAlbumModalComponent, { centered: true });
    modalRef.componentInstance.crate = this.crate;
    modalRef.componentInstance.album = album;

    modalRef.dismissed.pipe(
      tap(() => {
        this.longPressed = undefined;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  handleSearch(search: string) {
    this.store.dispatch(reloadCrateAlbums({
      crate: this.crate,
      pageable: this.page,
      search,
    }));
  }

  toggleCrateListType(listType: ListType) {
    this.store.dispatch(toggleCrateAlbumListType({ listType }));
  }

  trackByAlbumId(index: number, album: Album): string {
    return String(album.id);
  }

  openSettings() {
    this.router.navigate(['/crate', this.crate.id, 'settings']);
  }

  protected readonly ListType = ListType;
}
