import csv
import sys
import json
import os
import math
from PIL import Image, ImageDraw, ImageFilter
#todo
# put this in the full program, why are some pixels missing?!!?!
#find a way to fix outer

pixelList = []
scannedPixels = []
linesList = []

def main(argv):
    filename = sys.argv[1]
    if filename.endswith('.csv'):
        filename=filename.replace('.csv','')
    if(not os.path.isdir("Coordinatefiles")):
        os.makedirs("Coordinatefiles")
    path = "Coordinatefiles/"+filename+".json"
    f= open(path,"w+")

    csvPath = "Coordinatefiles/"+filename+".csv"
    with open(csvPath, newline='') as csvfile:
        file = csv.reader(csvfile, delimiter=' ', quotechar='|')

        for row in file:
            xCoordinate=row[0].split(',')[0]
            yCoordinate=row[0].split(',')[1]
            coordinate=[int(xCoordinate),int(yCoordinate)]
            pixelList.append(coordinate)

    for pixel in pixelList:

        if(not checkAlreadyScanned(pixel)):
            if(hasRightPixel(pixel)):
                line = [0, 0]
                line[0]=[pixel[0],pixel[1]]
                temp=pixel
                if (isExistingPixel(pixel) and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while(hasRightPixel(temp)):
                    if(isExistingPixel(temp) and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp = [temp[0] + 1, temp[1]]
                    line[1]=temp
                linesList.append(line)

            if(hasLowerPixel(pixel)):
                line = [0, 0]
                line[0]=[pixel[0],pixel[1]]
                temp=pixel
                if (isExistingPixel(pixel) and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while(hasLowerPixel(temp)):
                    if (isExistingPixel(temp) and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp=[temp[0],temp[1]+1]
                    line[1]=temp
                linesList.append(line)

            if(hasLowerLeftPixel(pixel)):
                line = [0, 0]
                line[0] = [pixel[0], pixel[1]]
                temp = pixel
                if (isExistingPixel(pixel) and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while (hasLowerLeftPixel(temp)):
                    if (isExistingPixel(temp) and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp = [temp[0]-1, temp[1] + 1]
                    line[1] = temp
                linesList.append(line)

            if(hasLowerRightPixel(pixel)):
                line = [0, 0]
                line[0] = [pixel[0], pixel[1]]
                temp = pixel
                if (isExistingPixel(pixel) and not moreThanOneSurroundingPixel(pixel)):
                    scannedPixels.append(pixel)
                    pixelList.remove(pixel)
                while (hasLowerRightPixel(temp)):
                    if (isExistingPixel(temp) and not moreThanOneSurroundingPixel(temp)):
                        scannedPixels.append(temp)
                        pixelList.remove(temp)
                    temp = [temp[0]+1, temp[1] + 1]
                    line[1] = temp
                linesList.append(line)

    draw(pixelList,linesList,argv)

    d={'lines':linesList,'pixels':pixelList}
    f.write('{\"')
    f.write(filename)
    f.write('\":[')
    f.write(json.dumps(d))
    f.write("]}")

def toText(list):
    str1 = ''.join(''.join(list))
    return str1

def moreThanOneSurroundingPixel(pixel):
    surroundingpixels=0
    # print(pixel)
    if(isExistingPixel([pixel[0]+1,pixel[1]])):
        surroundingpixels+=1
    if(isExistingPixel([pixel[0],pixel[1]+1])):
        surroundingpixels+=1
    if(isExistingPixel([pixel[0]+1,pixel[1]-1])):
        surroundingpixels+=1
    if(isExistingPixel([pixel[0]+1,pixel[1]+1])):
        surroundingpixels+=1
    if(isExistingPixel([pixel[0]-1,pixel[1]+1])):
        surroundingpixels+=1
    # print(surroundingpixels)
    if(surroundingpixels>2):
        # print(pixel, "has surrounding")
        return True
    else:
        return False

def hasLowerPixel(pixel):
    lowerPixel = [pixel[0],pixel[1]+1]
    if(isExistingPixel(lowerPixel)):
        return True
    return False

def hasRightPixel(pixel):
    rightpixel = [pixel[0]+1,pixel[1]]
    if(isExistingPixel(rightpixel)):
        return True
    return False

def hasLowerLeftPixel(pixel):
    lowerLeftPixel = [pixel[0]-1,pixel[1]+1]
    if(isExistingPixel(lowerLeftPixel)):
        return True
    return False

def hasLowerRightPixel(pixel):
    lowerRightPixel = [pixel[0] + 1, pixel[1] + 1]
    if (isExistingPixel(lowerRightPixel)):
        return True
    return False

def isExistingPixel(toCheckPixel):
    # print(toCheckPixel)
    for pixel in pixelList:
        if(pixel == toCheckPixel):
            return True
    return False



def checkAlreadyScanned(pixel):
    for scannedpixel in scannedPixels:
        if(pixel == scannedpixel):
            return True
    return False

def draw(pixels, lines,argv):
    # width, sep, tail = argv[2].partition('.')
    # height,sep, tail = argv[3].partition('.')
    # canvas = (int(width), int(height))
    canvas = (2046, 2500)
    scale = 1
    thumb = canvas[0] / scale, canvas[1] / scale
    im = Image.new('RGBA', canvas, (255, 255, 255, 255))
    draw = ImageDraw.Draw(im)
    for line in linesList:
        draw.line((line[0][0],line[0][1],line[1][0],line[1][1]),fill="black")
    for pixel in pixelList:
        draw.point([pixel[0],pixel[1]],fill="black")
    im.thumbnail(thumb)
    pngfile , sep, tail = argv[1].partition('.')
    im.save("Coordinatefiles/"+pngfile+'.png')

def combineAllFloors():
    print("helloooo")


if __name__ == '__main__':
    main(sys.argv)