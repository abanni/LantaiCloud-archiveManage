export interface ArchiveRecord {
  file_id: string;
  project_id: string;
  parent_id: string;
  ancestors: string;
  tag: 'zj' | 'zj_item' | 'zj_volume' | '';
  file_type: 'folder' | 'file' | '';
  file_name: string;
  original_name: string;
  ext_name: string;
  archive_code: string;
  check_no: string;
  order_no: string;
  doc_no: string;
  license_no: string;
  registration_no: string;
  storage_period: string;
  secrecy_level: string;
  construction_company: string;
  supervisor_company: string;
  compilation_company: string;
  carrier_type: string;
  volume_name: string;
  volume_title: string;
  built_area: string;
  height: string;
  structure_type: string;
  under_floor: string;
  up_floor: string;
  start_time: string;
  end_time: string;
  input_by: string;
  input_time: string;
  text_page: string;
  drawing_num: string;
  total_volume: string;
  text_volume: string;
  drawing_volume: string;
  url: string;
  bit_size: string;
  sort_by: string;
  archive_status?: string;
  era?: string;
  era_doc_no?: string;
  micro_no?: string;
}

export interface ArchiveTreeNode {
  id: string;
  type: 'PROJECT' | 'UNIT' | 'VOLUME' | 'FILE';
  label: string;
  expanded?: boolean;
  data: ArchiveRecord;
  children?: ArchiveTreeNode[];
}
