export class PictureComponent {
  @ViewChild('video') videoElm: ElementRef;
  @ViewChild('canvas') canvasElm: ElementRef;

  readonly medias: MediaStreamConstraints = {audio: false, video: {
    facingMode: 'user',
    // facingMode: {
    //   exact : 'environment'
    // },
  }};
  private captureData: string;

  function constructor(
    private renderer: Renderer2,
    private apiService: ApiService,
  ) { }

  function ngAfterViewInit() {
    this.startCamera();
  }

  function onClick() {
    this.captureData = this.draw();
    this.stopCamera();
    this.savePicture();
  }

  private function draw() {
    // 写真のサイズを決める
    const WIDTH = this.videoElm.nativeElement.clientWidth;
    const HEIGHT = this.videoElm.nativeElement.clientHeight;

    // canvasを用意する
    const ctx = this.canvasElm.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.canvasElm.nativeElement.width  = WIDTH;
    this.canvasElm.nativeElement.height = HEIGHT;

    // canvasの描画をしつつBase64データを取る
    return this.canvasElm.nativeElement.toDataURL(ctx.drawImage(this.videoElm.nativeElement, 0, 0, WIDTH, HEIGHT));
  }

  private function startCamera() {
    window.navigator.mediaDevices.getUserMedia(this.medias)
      .then(stream => this.videoElm.nativeElement.srcObject = stream)
      .catch(error => {
        console.error(error);
        alert(error);
      });
  }

  private function stopCamera() {
    this.videoElm.nativeElement.pause();
    const track = this.videoElm.nativeElement.srcObject.getTracks()[0] as MediaStreamTrack;
    track.stop();
  }

  private function savePicture() {
    this.apiService.savePicture(this.captureData);

    const a = this.renderer.createElement('a') as HTMLAnchorElement;
    a.href = this.captureData;
    a.setAttribute('download', 'image.png');
    // a.click();
  }
}