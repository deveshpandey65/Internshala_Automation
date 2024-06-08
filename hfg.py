hand = [1,2,3,6,2,3,4,7,8]
groupSize = 3
if len(hand) % groupSize != 0:
    print(False)
        
hand.sort()
print(hand)
while hand:
    first = hand[0]
    print(first,"first")
    for i in range(groupSize):
        print(first+1)
        if first + i not in hand:
            print(False)
        hand.remove(first + i)
        print(hand,"handprint")
        
        
print(True)