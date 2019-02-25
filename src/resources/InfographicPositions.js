const film = [{"id":"logo_0","left":"378px","top":"115px","content":"3ds_max_icon.png","type":"img"},{"id":"logo_1","left":"268px","top":"71px","content":"AE-logo.png","type":"img"},{"id":"logo_2","left":"422px","top":"262px","content":"arri-logo.jpg","type":"img"},{"id":"logo_3","left":"377px","top":"193px","content":"avid-media-composer-logo_o.png","type":"img"},{"id":"logo_4","left":"456px","top":"116px","content":"blender logo.jpg","type":"img"},{"id":"logo_5","left":"218px","top":"259px","content":"digital-cam-icon.jpg","type":"img"},{"id":"logo_6","left":"260px","top":"258px","content":"dslr-icon.png","type":"img"},{"id":"logo_7","left":"280px","top":"192px","content":"finalcutx.png","type":"img"},{"id":"logo_8","left":"401px","top":"24px","content":"Houdini3D_icon.png","type":"img"},{"id":"logo_9","left":"131px","top":"192px","content":"iMovie.webp","type":"img"},{"id":"logo_10","left":"298px","top":"258px","content":"iphone-icon.png","type":"img"},{"id":"logo_11","left":"239px","top":"193px","content":"logo-premiere-pro.png","type":"img"},{"id":"logo_12","left":"418px","top":"115px","content":"maya.jpg","type":"img"},{"id":"logo_13","left":"305px","top":"70px","content":"nuke-logo.png","type":"img"},{"id":"logo_14","left":"379px","top":"263px","content":"RedStickerLogo.png","type":"img"},{"id":"logo_15","left":"171px","top":"192px","content":"vegaspro.jpg","type":"img"},{"id":"logo_16","left":"438px","top":"24px","content":"zbrush-logo.png","type":"img"},{"id":"text_1","left":"254px","top":"152px","content":"Video editing","type":"text"},
{"id":"container_0","left":"254px","top":"152px","content":"logo_5, logo_6, logo_10", "outer": "container_1", "type":"container"},
{"id":"container_1","left":"254px","top":"152px","content":"logo_7, logo_11", "outer": "container_2", "type":"container"},

{"id":"container_2","left":"254px","top":"152px","content":"logo_1, logo_13", "outer": "container_3, container_4", "type":"container"},
{"id":"container_3","left":"254px","top":"152px","content":"logo_8, logo_16", "outer": "", "type":"container"},
{"id":"container_4","left":"254px","top":"152px","content":"logo_4, logo_0, logo_12", "outer": "", "type":"container"},


]
/*[{"id":"logo_0","left":"423px","top":"137px","src":"3ds_max_icon.png"},{"id":"logo_1","left":"268px","top":"98px","src":"AE-logo.png"},{"id":"logo_2","left":"394px","top":"268px","src":"arri-logo.jpg"},{"id":"logo_3","left":"391px","top":"210px","src":"avid-media-composer-logo_o.png"},{"id":"logo_4","left":"463px","top":"137px","src":"blender logo.jpg"},{"id":"logo_5","left":"225px","top":"273px","src":"digital-cam-icon.jpg"},{"id":"logo_6","left":"269px","top":"271px","src":"dslr-icon.png"},{"id":"logo_7","left":"223px","top":"212px","src":"finalcutx.png"},{"id":"logo_8","left":"381px","top":"42px","src":"Houdini3D_icon.png"},{"id":"logo_9","left":"307px","top":"208px","src":"iMovie.webp"},{"id":"logo_10","left":"307px","top":"271px","src":"iphone-icon.png"},{"id":"logo_11","left":"269px","top":"209px","src":"logo-premiere-pro.png"},{"id":"logo_12","left":"384px","top":"136px","src":"maya.jpg"},{"id":"logo_13","left":"379px","top":"98px","src":"nuke-logo.png"},{"id":"logo_14","left":"447px","top":"272px","src":"RedStickerLogo.png"},{"id":"logo_15","left":"181px","top":"211px","src":"vegaspro.jpg"},{"id":"logo_16","left":"467px","top":"43px","src":"zbrush-logo.png"}]*/

const filmTimecode = [
  {
    id: "logo_6",
    time: 0.0
  },
  {
    id: "logo_11",
    time: 5.0
  },
  {
    id: "logo_1",
    time: 10.0
  }
  ]





module.exports = {
  film: film,
  filmTimecode: filmTimecode
}
