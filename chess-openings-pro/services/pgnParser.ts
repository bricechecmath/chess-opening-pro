
import { Chess } from 'chess.js';
import { MoveNode } from '../types';

export class PgnParser {
  /**
   * Extrait les coups d'un texte PGN en ignorant tout le reste (commentaires, NAGs, numéros).
   */
  static parse(pgn: string): MoveNode[] {
    // 1. Supprimer les en-têtes [Event "..."]
    let body = pgn.replace(/\[.*?\]/g, '');

    // 2. Nettoyage par machine à états pour supprimer {commentaires} et (variantes temporairement)
    // On veut d'abord nettoyer les commentaires car ils peuvent contenir des parenthèses ou des chiffres.
    let cleanBody = "";
    let depth = 0;
    let inComment = false;

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === '{') inComment = true;
      else if (char === '}') { inComment = false; continue; }
      
      if (!inComment) cleanBody += char;
    }

    // 3. Tokenisation propre
    // On remplace les parenthèses par des espaces autour pour bien les isoler
    const tokens = cleanBody
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(t => t.length > 0);

    const roots: MoveNode[] = [];
    const game = new Chess();
    
    // Pile pour gérer les branches : [FEN, ParentNode]
    const stack: { fen: string, parent: MoveNode | null }[] = [];
    
    let currentParent: MoveNode | null = null;

    for (const token of tokens) {
      // Ignorer les numéros de coups (1., 1..., 12., etc.)
      if (/^\d+\.*$/.test(token)) continue;
      
      // Ignorer les résultats de match
      if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) continue;

      if (token === '(') {
        // Début de variante : on sauvegarde la position actuelle (avant le dernier coup)
        // Mais attention, dans un PGN, la parenthèse arrive APRÈS le coup principal.
        // Donc on doit revenir en arrière d'un coup pour jouer la variante.
        const lastFenBeforeMove = game.fen();
        game.undo();
        stack.push({ 
          fen: lastFenBeforeMove, // On stocke la FEN *après* le coup principal pour y revenir à la fin
          parent: currentParent 
        });
        
        // Le parent de la variante est le parent du coup qu'on vient d'annuler
        currentParent = currentParent?.parentId ? this.findNodeInRoots(roots, currentParent.parentId) : null;
        continue;
      }

      if (token === ')') {
        // Fin de variante : on restaure la position d'après le coup principal
        const state = stack.pop();
        if (state) {
          game.load(state.fen);
          currentParent = state.parent;
        }
        continue;
      }

      // Nettoyer les symboles de force (!!, !?, etc.)
      const san = token.replace(/[!?+#]+/g, '');

      try {
        const move = game.move(san);
        if (move) {
          const newNode: MoveNode = {
            id: Math.random().toString(36).substr(2, 9),
            san: move.san,
            fen: game.fen(),
            children: [],
            parentId: currentParent?.id
          };

          if (currentParent) {
            // Éviter d'ajouter deux fois le même coup s'il y a des redondances dans le PGN
            if (!currentParent.children.find(c => c.san === newNode.san)) {
              currentParent.children.push(newNode);
            }
            // Si le coup existe déjà, on se déplace simplement dessus
            else {
              currentParent = currentParent.children.find(c => c.san === newNode.san)!;
              continue;
            }
          } else {
            const existingRoot = roots.find(r => r.san === newNode.san);
            if (!existingRoot) roots.push(newNode);
            else { currentParent = existingRoot; continue; }
          }

          currentParent = newNode;
        }
      } catch (e) {
        // Si le coup est invalide (souvent des reprises de notation type 3... cxd4), on ignore
      }
    }

    return roots;
  }

  private static findNodeInRoots(roots: MoveNode[], id: string): MoveNode | null {
    const queue = [...roots];
    while (queue.length > 0) {
      const node = queue.shift()!;
      if (node.id === id) return node;
      if (node.children) queue.push(...node.children);
    }
    return null;
  }
}
