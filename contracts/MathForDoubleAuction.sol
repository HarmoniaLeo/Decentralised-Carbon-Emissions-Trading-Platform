// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

contract MathForDoubleAuction {

  function getAvg(int32 a, int32 b) pure internal returns(int32){
      return (a + b)/2;
  }

  /*Buyers are in descending order, with the highest price in front*/
  function quickSortDescending(int32[] storage arr, int32 left, int32 right) internal  {
        int32 i = left;
        int32 j = right;
        uint32 pivotIndex = uint32(left + (right - left) / 2);
        int32 pivot = arr[pivotIndex];
        while (i <= j) {
            while (arr[uint32(i)] > pivot) i++;
            while (arr[uint32(j)] < pivot) j--;
            if (i <= j) {
                (arr[uint32(i)], arr[uint32(j)]) = (arr[uint32(j)], arr[uint32(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            return quickSortDescending(arr, left, j);
        if (i < right)
            return quickSortDescending(arr, i, right);
    }

  /*Sellers are in ascending order, with the lowest price in front*/
  function quickSortAscending(int32[] storage arr, int32 left, int32 right) internal {
        int32 i = left;
        int32 j = right;
        uint32 pivotIndex = uint32(left + (right - left) / 2);
        int32 pivot = arr[pivotIndex];
        while (i <= j) {
            while (arr[uint32(i)] < pivot) i++;
            while (arr[uint32(j)] > pivot) j--;
            if (i <= j) {
                (arr[uint32(i)], arr[uint32(j)]) = (arr[uint32(j)], arr[uint32(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            return quickSortAscending(arr, left, j);
        if (i < right)
            return quickSortAscending(arr, i, right);
    }
}
