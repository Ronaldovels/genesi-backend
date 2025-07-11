import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// GET: Buscar todos os projetos de um usuário
router.get('/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ user: req.params.userId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar projetos." });
  }
});

// POST: Criar um novo projeto
router.post('/', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar projeto." });
  }
});

// PUT: Atualizar um projeto existente
router.put('/:projectId', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.projectId, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar projeto." });
  }
});

// PATCH: Alternar o status 'isActive' de um projeto
router.patch('/toggle/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: "Projeto não encontrado." });

        project.isActive = !project.isActive;
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: "Erro ao alternar status do projeto." });
    }
});


// DELETE: Deletar um projeto
router.delete('/:projectId', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ message: "Projeto deletado com sucesso." });
  } catch (error) {
    res.status(400).json({ message: "Erro ao deletar projeto." });
  }
});

export default router;