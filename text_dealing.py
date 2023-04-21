import re
import langid
# 处理chatgpt返回的句子，将中、英、日文部分分别转化为vits输入形式
enRe=re.compile(r'(?![0-9\s\u3001\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]+)[A-Za-z\d\s!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~\u3001\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01]+')
jaRe=re.compile(r'(?![0-9\s\u3001-\u3004\u3006-\u3039\uff01\uff1f]+)[\d\s\u3001-\u30ff\u4e00-\u9fff\uff01\uff11-\uff19\uff1f\uff21-\uff3a\uff41-\uff5a\uff66-\uff9d]+')
chRe=re.compile(r'(?![0-9\s\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01]+)[\d\s\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01]+')

def en_dealing(text: str): 
    text=re.sub(enRe, lambda x: '[EN]'+x.group(0)+'[EN]', text)
    return text

def ch_dealing(text: str): 
    text=re.sub(enRe, lambda x: '[EN]'+x.group(0)+'[EN]', text)
    text=re.sub(chRe, lambda x: '[ZH]'+x.group(0)+'[ZH]', text)
    return text

def ja_dealing(text: str): 
    text=re.sub(enRe, lambda x: '[EN]'+x.group(0)+'[EN]', text)
    text=re.sub(jaRe, lambda x: '[JA]'+x.group(0)+'[JA]', text)
    return text

# 以下是正则表达式识别语言的废案
# if_en_re=re.compile(r'(?![0-9\s!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]+)[A-Za-z\d\s!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]+')
# if_ja_re=re.compile(r'(?![0-9\sA-Za-z\d\s!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]+)[\d\s\u3001-\u30ff\u4e00-\u9fff\uff01\uff11-\uff19\uff1f\uff21-\uff3a\uff41-\uff5a\uff66-\uff9dA-Za-z\d\s!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]+')

# 根据句子来自动选择语言模式
def select_lang_mode(text: str): 
    
    # 以下是正则表达式识别语言的废案
    # if re.match(if_en_re, text) and re.match(if_en_re, text).group()==text: 
    #     return en_dealing(text)
    # elif re.match(if_ja_re, text) and re.match(if_ja_re, text).group()==text: 
    #     return ja_dealing(text)
    # else: 
    #     return ch_dealing(text)
    
    if langid.classify(text)[0]=='en': 
        return en_dealing(text)
    elif langid.classify(text)[0]=='ja': 
        return ja_dealing(text)
    else: 
        return ch_dealing(text)


