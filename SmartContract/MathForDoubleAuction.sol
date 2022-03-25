// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MathForDoubleAuction {

  function getAvg(int a, int b) pure internal returns(int){
      return (a + b)/2;
  }

  /*Buyers are in descending order, with the highest price in front*/
  function quickSortDescending(int[] storage arr, int left, int right) internal  {
        int i = left;
        int j = right;
        uint pivotIndex = uint(left + (right - left) / 2);
        int pivot = arr[pivotIndex];
        while (i <= j) {
            while (arr[uint(i)] > pivot) i++;
            while (arr[uint(j)] < pivot) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
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
  function quickSortAscending(int[] storage arr, int left, int right) internal {
        int i = left;
        int j = right;
        uint pivotIndex = uint(left + (right - left) / 2);
        int pivot = arr[pivotIndex];
        while (i <= j) {
            while (arr[uint(i)] < pivot) i++;
            while (arr[uint(j)] > pivot) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
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