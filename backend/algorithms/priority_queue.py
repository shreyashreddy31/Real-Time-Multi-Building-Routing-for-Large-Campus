from typing import Any, Tuple

class MinHeap:
    """Array-based binary min-heap."""
    def __init__(self):
        self._heap = []
        self._counter = 0
        
    def push(self, priority: float, item: Any) -> None:
        entry = (priority, self._counter, item)
        self._counter += 1
        self._heap.append(entry)
        self._sift_up(len(self._heap) - 1)
        
    def pop(self) -> Tuple[float, Any]:
        if self.is_empty():
            raise IndexError("pop from empty heap")
        
        last = self._heap.pop()
        if self._heap:
            return_item = self._heap[0]
            self._heap[0] = last
            self._sift_down(0)
        else:
            return_item = last
            
        return return_item[0], return_item[2]
        
    def peek(self) -> Tuple[float, Any]:
        if self.is_empty():
            raise IndexError("peek from empty heap")
        item = self._heap[0]
        return item[0], item[2]
        
    def is_empty(self) -> bool:
        return len(self._heap) == 0
        
    def __len__(self) -> int:
        return len(self._heap)
        
    def _sift_up(self, idx: int) -> None:
        item = self._heap[idx]
        while idx > 0:
            parent_idx = (idx - 1) >> 1
            parent = self._heap[parent_idx]
            # Compare priority, then counter
            if item[0] < parent[0] or (item[0] == parent[0] and item[1] < parent[1]):
                self._heap[idx] = parent
                idx = parent_idx
            else:
                break
        self._heap[idx] = item
        
    def _sift_down(self, idx: int) -> None:
        end_idx = len(self._heap)
        item = self._heap[idx]
        child_idx = (idx << 1) + 1
        while child_idx < end_idx:
            right_idx = child_idx + 1
            # Pick smaller child
            if right_idx < end_idx:
                rc = self._heap[right_idx]
                lc = self._heap[child_idx]
                if rc[0] < lc[0] or (rc[0] == lc[0] and rc[1] < lc[1]):
                    child_idx = right_idx
            
            child = self._heap[child_idx]
            if item[0] < child[0] or (item[0] == child[0] and item[1] < child[1]):
                break
            
            self._heap[idx] = child
            idx = child_idx
            child_idx = (idx << 1) + 1
            
        self._heap[idx] = item
