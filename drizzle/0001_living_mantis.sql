-- Custom SQL migration file, put you code below! --
INSERT INTO `applications` ('name', 'short_code', 'client_id') VALUES ('Jira', 'jira', 'NOT REQUIRED');
--> statement-breakpoint
CREATE VIRTUAL TABLE `search_idx` USING fts5('name', 'description', content=`data_node`, content_rowid='id', tokenize="trigram");
--> statement-breakpoint
CREATE TRIGGER tbl_data_node_i AFTER INSERT ON data_node BEGIN
  INSERT INTO search_idx(rowid, name, description) VALUES (new.id, new.name, new.description);
END;
--> statement-breakpoint
CREATE TRIGGER tbl_data_node_d AFTER DELETE ON data_node BEGIN
  INSERT INTO search_idx(search_idx, rowid, name, description) VALUES('delete', old.id, old.name, old.description);
END;
--> statement-breakpoint
CREATE TRIGGER tbl_data_node_u AFTER UPDATE ON data_node BEGIN
  INSERT INTO search_idx(search_idx, rowid, name, description) VALUES('delete', old.id, old.name, old.description);
  INSERT INTO search_idx(rowid, name, description) VALUES (new.id, new.name, new.description);
END;
--> statement-breakpoint
CREATE VIRTUAL TABLE `quick_action_idx` USING fts5('name', 'description', content=`quick_actions`, content_rowid='id', tokenize="trigram");
--> statement-breakpoint
CREATE TRIGGER tbl_quick_actions_i AFTER INSERT ON quick_actions BEGIN
  INSERT INTO quick_action_idx(rowid, name, description) VALUES (new.id, new.name, new.description);
END;
--> statement-breakpoint
CREATE TRIGGER tbl_quick_actions_d AFTER DELETE ON quick_actions BEGIN
  INSERT INTO quick_action_idx(quick_action_idx, rowid, name, description) VALUES('delete', old.id, old.name, old.description);
END;
--> statement-breakpoint
CREATE TRIGGER tbl_quick_actions_u AFTER UPDATE ON quick_actions BEGIN
  INSERT INTO quick_action_idx(quick_action_idx, rowid, name, description) VALUES('delete', old.id, old.name, old.description);
  INSERT INTO quick_action_idx(rowid, name, description) VALUES (new.id, new.name, new.description);
END;
