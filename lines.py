import csv
import sys
import json
import os
import glob
from PIL import Image, ImageDraw

sys.setrecursionlimit(20000)

blobsize = 100
pixelList = []
scannedPixels = []
linesList = []
allPixels = []
gevondenpixels = []
bloblist = []
buildingcount = 1
pngwidth = 0
pngheight = 0

# python3 lines.py <buildingcount> <pngwidth> <pngheigt>

def main():
    checkParameters()
    path="Coordinatefiles/*.csv"
    for fname in glob.glob(path):
        global pixelList, scannedPixels, linesList, allPixels,gevondenpixels,bloblist
        pixelList, scannedPixels, linesList, allPixels, gevondenpixels, bloblist = [[],[],[],[],[],[]]
        start(fname)

def checkParameters():
    if len(sys.argv) != 4:
        print("To few arguments!")
        print("Arguments should be: <buildingcount> <pngwidth> <pngheigt>")
        exit(1)
    else:
        global buildingcount, pngwidth, pngheight
        buildingcount = sys.argv[1]
        pngwidth=int(sys.argv[2])
        pngheight=int(sys.argv[3])

def start(fname):

    filename = fname.rsplit('/',1)[1]
    if filename.endswith('.csv'):
        filename=filename.replace('.csv','')
    if(not os.path.isdir("Coordinatefiles")):
        os.makedirs("Coordinatefiles")
    path = "Coordinatefiles/"+filename+".json"
    f= open(path,"w+")

    with open(fname, newline='') as csvfile:
        file = csv.reader(csvfile, delimiter=' ', quotechar='|')

        for row in file:
            xCoordinate=row[0].split(',')[0]
            yCoordinate=row[0].split(',')[1]
            coordinate=[int(xCoordinate),int(yCoordinate)]
            allPixels.append(coordinate)

    for pixel in allPixels:
        blob = []
        if (not pixel in gevondenpixels):
            checkSurroundingPixels(pixel, blob)
        if(len(blob)>blobsize):
            bloblist.append(blob)
    bloblist.sort(key=len, reverse=True)

    for i in range(0,min(int(buildingcount),int(len(bloblist)))):
        for pixel in bloblist[i]:
            pixelList.append(pixel)

    for pixel in pixelList:
        if(not checkAlreadyScanned(pixel)):
            if(hasRightPixel(pixel)):
                line = [0, 0]
                line[0]=[pixel[0],pixel[1]]
                temp=pixel
                if (pixel in pixelList and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while(hasRightPixel(temp)):
                    if(temp in pixelList and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp = [temp[0] + 1, temp[1]]
                    line[1]=temp
                linesList.append(line)

            if(hasLowerPixel(pixel)):
                line = [0, 0]
                line[0]=[pixel[0],pixel[1]]
                temp=pixel
                if (pixel in pixelList and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while(hasLowerPixel(temp)):
                    if (temp in pixelList and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp=[temp[0],temp[1]+1]
                    line[1]=temp
                linesList.append(line)

            if(hasLowerLeftPixel(pixel)):
                line = [0, 0]
                line[0] = [pixel[0], pixel[1]]
                temp = pixel
                if (pixel in pixelList and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while (hasLowerLeftPixel(temp)):
                    if (temp in pixelList and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp = [temp[0]-1, temp[1] + 1]
                    line[1] = temp
                linesList.append(line)

            if(hasLowerRightPixel(pixel)):
                line = [0, 0]
                line[0] = [pixel[0], pixel[1]]
                temp = pixel
                if (pixel in pixelList and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while (hasLowerRightPixel(temp)):
                    if (temp in pixelList and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp = [temp[0]+1, temp[1] + 1]
                    line[1] = temp
                linesList.append(line)

    floor={'lines':linesList,'pixels':pixelList}
    f.write('{\"')
    f.write(filename)
    f.write('\":')
    f.write(json.dumps(floor))
    f.write("}")
    draw(pixelList,linesList,filename)

def checkSurroundingPixels(pixel, blob):
    if (pixel in allPixels and not pixel in gevondenpixels and not pixel in blob):blob.append(pixel)
    if(not hasSurroundingPixel(pixel, allPixels)):
        return blob
    else:
        for surroundingpixel in getSurroundingPixel(pixel, allPixels):
            if(surroundingpixel in allPixels and not surroundingpixel in gevondenpixels and not surroundingpixel in blob):
                blob.append(surroundingpixel)
                gevondenpixels.append(surroundingpixel)
                allPixels.remove(surroundingpixel)
                checkSurroundingPixels(surroundingpixel,blob)

def getSurroundingPixel(pixel, pixellijst):
    tempPixelArray = []
    if ( [pixel[0] + 1 , pixel[1]] in pixellijst):tempPixelArray.append([pixel[0] + 1 , pixel[1]])
    if ( [pixel[0] + 1 , pixel[1] - 1] in pixellijst ):tempPixelArray.append([pixel[0] + 1 , pixel[1] - 1])
    if ( [pixel[0] + 1 , pixel[1] + 1] in pixellijst ):tempPixelArray.append([pixel[0] + 1 , pixel[1] + 1])
    if ( [pixel[0] , pixel[1] + 1] in pixellijst ):tempPixelArray.append([pixel[0], pixel[1] + 1])
    if ( [pixel[0] , pixel[1] - 1] in pixellijst ):tempPixelArray.append([pixel[0], pixel[1] - 1])
    if ( [pixel[0] - 1 , pixel[1] + 1] in pixellijst ):tempPixelArray.append([pixel[0] - 1 , pixel[1] + 1])
    if ( [pixel[0] - 1 , pixel[1] - 1] in pixellijst ):tempPixelArray.append([pixel[0] - 1 , pixel[1] - 1])
    if ( [pixel[0] - 1 , pixel[1]] in pixellijst ):tempPixelArray.append([pixel[0] - 1 , pixel[1]])
    return tempPixelArray

def hasSurroundingPixel(pixel,pixellijst):
    if ([pixel[0] + 1 , pixel[1]] in pixellijst or
        [pixel[0] + 1 , pixel[1] - 1] in pixellijst  or
        [pixel[0] + 1 , pixel[1] + 1] in pixellijst or
        [pixel[0] , pixel[1] + 1] in pixellijst or
        [pixel[0] , pixel[1] - 1] in pixellijst or
        [pixel[0] - 1 , pixel[1] + 1] in pixellijst or
        [pixel[0] - 1 , pixel[1] - 1] in pixellijst or
        [pixel[0] - 1 , pixel[1]] in pixellijst):
        return True
    else:
        return False

def moreThanOneSurroundingPixel(pixel):
    surroundingpixels=0
    if ( [pixel[0] + 1 , pixel[1]] in allPixels):surroundingpixels+=1
    if ( [pixel[0] + 1 , pixel[1] - 1] in allPixels):surroundingpixels+=1
    if ( [pixel[0] + 1 , pixel[1] + 1] in allPixels):surroundingpixels+=1
    if ( [pixel[0] , pixel[1] + 1] in allPixels):surroundingpixels+=1
    if ( [pixel[0] , pixel[1] - 1] in allPixels):surroundingpixels+=1
    if ( [pixel[0] - 1 , pixel[1] + 1] in allPixels):surroundingpixels+=1
    if ( [pixel[0] - 1 , pixel[1] - 1] in allPixels):surroundingpixels+=1
    if ( [pixel[0] - 1 , pixel[1]] in allPixels):surroundingpixels+=1
    if(surroundingpixels>2):
        return True
    else:
        return False

def hasLowerPixel(pixel):
    lowerPixel = [pixel[0],pixel[1]+1]
    if(lowerPixel in pixelList):
        return True
    return False

def hasRightPixel(pixel):
    rightpixel = [pixel[0]+1,pixel[1]]
    if(rightpixel in pixelList):
        return True
    return False

def hasLowerLeftPixel(pixel):
    lowerLeftPixel = [pixel[0]-1,pixel[1]+1]
    if(lowerLeftPixel in pixelList):
        return True
    return False

def hasLowerRightPixel(pixel):
    lowerRightPixel = [pixel[0] + 1, pixel[1] + 1]
    if (lowerRightPixel in pixelList):
        return True
    return False

def checkAlreadyScanned(pixel):
    for scannedpixel in scannedPixels:
        if(pixel == scannedpixel):
            return True
    return False

def draw(pixelList, linesList,file):
    canvas = (int(pngwidth),int(pngheight))
    scale = 1
    thumb = canvas[0] / scale, canvas[1] / scale
    im = Image.new('RGBA', canvas, (255, 255, 255, 255))
    draw = ImageDraw.Draw(im)
    for line in linesList:
        draw.line((line[0][0],line[0][1],line[1][0],line[1][1]),fill="black")
    for pixel in pixelList:
        draw.point([pixel[0],pixel[1]],fill="black")
    im.thumbnail(thumb)
    pngfile , sep, tail = file.partition('.')
    im.save("Coordinatefiles/"+pngfile+"outline"+'.png')

if __name__ == '__main__':
    main()