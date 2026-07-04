import { ArchiveRecord, ArchiveTreeNode } from '../types/archive';
import rawData from './archiveData.json';

export const ARCHIVE_RECORDS: ArchiveRecord[] = rawData as ArchiveRecord[];

// Build tree from flat records
export function buildArchiveTree(records: ArchiveRecord[]): ArchiveTreeNode[] {
  const map = new Map<string, ArchiveTreeNode>();

  // Create nodes for all records
  records.forEach(r => {
    const type = r.tag === 'zj' ? 'PROJECT'
      : r.tag === 'zj_item' ? 'UNIT'
      : r.tag === 'zj_volume' ? 'VOLUME'
      : 'FILE';

    map.set(r.file_id, {
      id: r.file_id,
      type,
      label: (r.tag === 'zj' ? '昆山市白莲湖低空飞行试验场项目' : r.file_name) || r.original_name || r.volume_title || '未命名',
      expanded: true,
      data: r,
      children: [],
    });
  });

  const roots: ArchiveTreeNode[] = [];

  map.forEach(node => {
    const parentId = node.data.parent_id;
    if (parentId && parentId !== '0' && map.has(parentId)) {
      const parent = map.get(parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by order_no
  const sortChildren = (nodes: ArchiveTreeNode[]) => {
    nodes.forEach(n => {
      if (n.children && n.children.length > 0) {
        n.children.sort((a, b) => {
          const oa = parseInt(a.data.order_no) || 0;
          const ob = parseInt(b.data.order_no) || 0;
          return oa - ob;
        });
        sortChildren(n.children);
      }
    });
  };
  sortChildren(roots);

  return roots;
}

// Get project-level info (the root)
export function getProjectInfo(records: ArchiveRecord[]): ArchiveRecord | null {
  return records.find(r => r.tag === 'zj') || null;
}

// Get unit-level items
export function getUnitItems(records: ArchiveRecord[]): ArchiveRecord[] {
  return records.filter(r => r.tag === 'zj_item');
}

// Get volumes
export function getVolumeItems(records: ArchiveRecord[]): ArchiveRecord[] {
  return records.filter(r => r.tag === 'zj_volume');
}

// Get files
export function getFileItems(records: ArchiveRecord[]): ArchiveRecord[] {
  return records.filter(r => r.file_type === 'file');
}
