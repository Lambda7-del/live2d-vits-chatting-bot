import IPython.display as ipd
import torch
from . import commons, utils, text
from .models import SynthesizerTrn
from .text.symbols import symbols
from .text import text_to_sequence

def get_text(text, hps):
    text_norm = text_to_sequence(text, hps.data.text_cleaners)
    if hps.data.add_blank:
        text_norm = commons.intersperse(text_norm, 0)
    text_norm = torch.LongTensor(text_norm)
    return text_norm

class vitsModel(): 
    def __init__(self, hp_path: str, model_path: str) -> None:
        self.hps = utils.get_hparams_from_file(hp_path)
        self.symbols=self.hps['symbols']
        symbols=self.symbols
        text._symbol_to_id, text._id_to_symbol=text.changeSymbol(symbols)
        self.net_g = SynthesizerTrn(
            len(symbols),
            self.hps.data.filter_length // 2 + 1,
            self.hps.train.segment_size // self.hps.data.hop_length,
            n_speakers=self.hps.data.n_speakers,
            **self.hps.model).cuda()
        _ = self.net_g.eval()


        _ = utils.load_checkpoint(model_path, self.net_g, None)
    
    def text_to_audio(self, text: str, speaker_id: int): 
        stn_tst = get_text(text, self.hps)
        with torch.no_grad():
            x_tst = stn_tst.cuda().unsqueeze(0)
            x_tst_lengths = torch.LongTensor([stn_tst.size(0)]).cuda()
            sid = torch.LongTensor([speaker_id]).cuda()
            audio = self.net_g.infer(x_tst, x_tst_lengths, sid=sid, noise_scale=.667, noise_scale_w=0.8, length_scale=1)[0][0,0].data.cpu().float().numpy()
        au=ipd.Audio(audio, rate=self.hps.data.sampling_rate, normalize=False)
        with open('./cache/audio/audio.wav', 'wb') as f:
            f.write(au.data)