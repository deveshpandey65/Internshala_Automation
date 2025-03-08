nums1 = [4,9,5]
nums2 = [9,4,9,8,4]
x=[]
l=nums1
for i in l:
    if i in nums2:
        x.append(i)
        nums2.pop(nums2.index(i))          
print(x)