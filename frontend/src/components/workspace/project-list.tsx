import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/projetc-card";

interface ProjectListProps {
  workspaceId: string;
  projects: Project[];

  onCreateProject: () => void;
}

export const ProjectList = ({
  workspaceId,
  projects,
  onCreateProject,
}: ProjectListProps) => {
  const approvedProjects = projects.filter((project) => project.isApproved);
  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Projects</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {approvedProjects.length === 0 ? (
          <NoDataFound
            title="No approved projects found"
            description="Create a project to get started or wait for a project to be approved"
            buttonText="Create Project"
            buttonAction={onCreateProject}
          />
        ) : (
          approvedProjects.map((project) => {
            const projectProgress = 0;

            return (
              <ProjectCard
                key={project._id}
                project={project}
                progress={projectProgress}
                workspaceId={workspaceId}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
