package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.validator.constraints.Length;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@Table(name = "sprint")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Sprint extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "real_end_date")
    private LocalDateTime realEndDate;

    @Column(name = "is_jira_sprint")
    private Boolean isJiraSprint;

    @Length(max = 1000)
    @Column(name = "jira_sprint_url")
    private String jiraSprintUrl;

    @Length(max = 1000)
    @Column(name = "jira_auth_key")
    private String jiraAuthKey;

    @Column(name = "allow_search")
    private Boolean allowSearch;

    @Column(name = "allow_auto_join")
    private Boolean allowAutoJoin;

    @Column(name = "activated")
    private Boolean activated;

    @Column(name = "do_daily_scrum_meeting")
    private Boolean doDailyScrumMeeting;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SprintUser> users;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SprintDailyMeeting> sprintDailyMeetings;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "project_id")
    private Project project;

}
